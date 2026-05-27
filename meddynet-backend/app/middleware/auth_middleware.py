from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError
from app.config import settings
from app.services.mongo_service import mongo_service

from app.utils.session_context import set_current_user_id


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Initialize default state
        request.state.user = None

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                # 1. Check if token is blacklisted (Revoked sessions)
                from app.redis import redis_client

                if await redis_client.exists(f"blacklist:{token}"):
                    request.state.user = None
                else:
                    # 2. Decode and verify payload
                    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])

                    # 3. Security Hardening: Direct is_active Enforcement
                    # If is_active is encoded in JWT, we can skip DB hit for performance
                    # but for 10000% immediate effect, we'll rely on the payload pulse.
                    if payload.get("is_active") == False:
                        request.state.user = None
                    else:
                        request.state.user = payload
                        set_current_user_id(payload.get("sub"))
            except JWTError:
                # Log unauthorized attempt (best-effort, non-blocking)
                try:
                    await mongo_service.log_event(
                        level="warning",
                        event="auth_failure",
                        message=f"Invalid JWT token from {request.client.host}",
                        context={"path": request.url.path},
                    )
                except Exception:
                    pass  # MongoDB may be unavailable

        response = await call_next(request)

        # Log critical status codes (best-effort, non-blocking)
        if response.status_code >= 400:
            try:
                user_id = request.state.user.get("sub") if request.state.user else "anonymous"
                await mongo_service.log_event(
                    level="error" if response.status_code >= 500 else "warning",
                    event="http_error",
                    message=f"Request to {request.url.path} failed with status {response.status_code}",
                    context={"user_id": user_id, "status": response.status_code},
                )
            except Exception:
                pass  # MongoDB may be unavailable

        return response
