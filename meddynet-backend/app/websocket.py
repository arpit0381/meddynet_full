import asyncio
import json
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.redis import redis_client

router = APIRouter(tags=["websockets"])


class ConnectionManager:
    def __init__(self):
        # Local state (for this specific worker instance)
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.pubsub = redis_client.pubsub()
        self.listener_task = None

    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
            # Subscribe to the channel in Redis on first local connection
            await self.pubsub.subscribe(channel)
            if not self.listener_task:
                self.listener_task = asyncio.create_task(self._listen_to_redis())

        self.active_connections[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

    async def broadcast(self, channel: str, message: dict):
        # Push message strictly to Redis to distribute to all workers
        await redis_client.publish(channel, json.dumps(message))

    async def _listen_to_redis(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                channel = message["channel"].decode() if isinstance(message["channel"], bytes) else message["channel"]
                data = message["data"].decode() if isinstance(message["data"], bytes) else message["data"]

                # Forward to all local websockets listening to this channel
                if channel in self.active_connections:
                    dead_sockets = set()
                    for connection in self.active_connections[channel]:
                        try:
                            await connection.send_text(data)
                        except Exception:
                            dead_sockets.add(connection)

                    for dead in dead_sockets:
                        self.disconnect(dead, channel)


manager = ConnectionManager()


@router.websocket("/ws/{client_type}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_type: str, client_id: str):
    # Channel structure: type:id e.g. "tech:uuid", "lab:uuid"
    channel = f"{client_type}:{client_id}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            event_type = payload.get("type")
            if event_type == "location_update":
                # Technician sending lat/lng
                # Broadcast to patient/lab listening to this technician's updates
                # e.g., tracking:{job_id} or tracking:{tech_id}
                job_id = payload.get("job_id")
                if job_id:
                    await manager.broadcast(f"tracking:{job_id}", payload)
            elif event_type == "job_dispatch":
                lab_id = payload.get("lab_id")
                if lab_id:
                    await manager.broadcast(f"lab:{lab_id}", payload)
            elif event_type == "support_message":
                ticket_id = payload.get("ticket_id")
                if ticket_id:
                    # FIX 2: Replaced broken 'async_session' import with 'SessionLocal'
                    from sqlalchemy.future import select

                    from app.database import SessionLocal
                    from app.models.booking import Booking

                    async with SessionLocal() as db:
                        res = await db.execute(select(Booking).filter(Booking.id == ticket_id))
                        booking = res.scalar_one_or_none()
                        if booking:
                            forward_payload = {
                                "type": "message",
                                "sender_id": client_id,
                                "sender_name": booking.patient_name,
                                "sender_phone": booking.patient_phone,
                                "booking_id": str(booking.id),
                                "text": payload.get("text", ""),
                            }
                            await manager.broadcast(f"lab:{booking.lab_id}", forward_payload)
            elif event_type == "message" and client_type == "lab":
                receiver_id = payload.get("receiver_id")
                if receiver_id:
                    forward_payload = {
                        "type": "support_message",
                        "sender": "lab",
                        "text": payload.get("text", ""),
                    }
                    await manager.broadcast(f"patient:{receiver_id}", forward_payload)
            else:
                # Default echo/broadcast
                await manager.broadcast(channel, payload)
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
    except Exception:
        manager.disconnect(websocket, channel)
