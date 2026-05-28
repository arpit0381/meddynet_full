import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import ConfigDict, BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.middleware.rbac import get_current_user
from app.models.support import SupportTicket, TicketStatus, TicketPriority
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["support"])

class TicketMessage(BaseModel):
    message: str = Field(..., max_length=1000)

class TicketCreate(BaseModel):
    subject: str = Field(..., max_length=200)
    description: str
    category: str | None = None
    priority: TicketPriority = TicketPriority.medium

class TicketUpdate(BaseModel):
    status: TicketStatus | None = None
    priority: TicketPriority | None = None

class TicketResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    subject: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    category: str | None
    messages: List[Dict[str, Any]]
    created_at: str
    updated_at: str | None

    model_config = ConfigDict(from_attributes=True)

def _check_admin(current_user: dict):
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")

@router.post("", response_model=TicketResponse, status_code=201)
async def create_ticket(
    payload: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """User - Create a new support ticket."""
    user_id = uuid.UUID(current_user["sub"])
    
    ticket = SupportTicket(
        user_id=user_id,
        subject=payload.subject,
        description=payload.description,
        category=payload.category,
        priority=payload.priority,
        messages=[]
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        category=ticket.category,
        messages=ticket.messages,
        created_at=ticket.created_at.isoformat() if ticket.created_at else "",
        updated_at=ticket.updated_at.isoformat() if ticket.updated_at else None
    )

@router.get("", response_model=List[TicketResponse])
async def list_user_tickets(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """User - List own tickets."""
    user_id = uuid.UUID(current_user["sub"])
    result = await db.execute(
        select(SupportTicket)
        .filter(SupportTicket.user_id == user_id)
        .order_by(SupportTicket.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    tickets = result.scalars().all()
    
    return [
        TicketResponse(
            id=t.id,
            user_id=t.user_id,
            subject=t.subject,
            description=t.description,
            status=t.status,
            priority=t.priority,
            category=t.category,
            messages=t.messages,
            created_at=t.created_at.isoformat() if t.created_at else "",
            updated_at=t.updated_at.isoformat() if t.updated_at else None
        ) for t in tickets
    ]

@router.get("/admin/all", response_model=List[TicketResponse])
async def list_all_tickets(
    skip: int = 0,
    limit: int = 100,
    status: TicketStatus | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - List all tickets."""
    _check_admin(current_user)
    
    query = select(SupportTicket)
    if status:
        query = query.filter(SupportTicket.status == status)
        
    query = query.order_by(SupportTicket.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    return [
        TicketResponse(
            id=t.id,
            user_id=t.user_id,
            subject=t.subject,
            description=t.description,
            status=t.status,
            priority=t.priority,
            category=t.category,
            messages=t.messages,
            created_at=t.created_at.isoformat() if t.created_at else "",
            updated_at=t.updated_at.isoformat() if t.updated_at else None
        ) for t in tickets
    ]

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a specific ticket."""
    result = await db.execute(select(SupportTicket).filter(SupportTicket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Check permissions
    if ticket.user_id != uuid.UUID(current_user["sub"]) and current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")
        
    return TicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        category=ticket.category,
        messages=ticket.messages,
        created_at=ticket.created_at.isoformat() if ticket.created_at else "",
        updated_at=ticket.updated_at.isoformat() if ticket.updated_at else None
    )

@router.post("/{ticket_id}/messages", response_model=TicketResponse)
async def add_message(
    ticket_id: str,
    payload: TicketMessage,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Add a message to a ticket thread."""
    result = await db.execute(select(SupportTicket).filter(SupportTicket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    # Check permissions
    is_admin = current_user.get("role") in ("admin", "superadmin")
    if ticket.user_id != uuid.UUID(current_user["sub"]) and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to reply to this ticket")
        
    sender = "Admin" if is_admin else "Patient"
    
    new_message = {
        "id": str(uuid.uuid4()),
        "sender": sender,
        "sender_id": current_user["sub"],
        "message": payload.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # SQLAlchemy requires re-assignment to detect JSON changes
    messages = ticket.messages.copy() if ticket.messages else []
    messages.append(new_message)
    ticket.messages = messages
    
    if is_admin and ticket.status == TicketStatus.open:
        ticket.status = TicketStatus.in_progress
        
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        category=ticket.category,
        messages=ticket.messages,
        created_at=ticket.created_at.isoformat() if ticket.created_at else "",
        updated_at=ticket.updated_at.isoformat() if ticket.updated_at else None
    )

@router.patch("/admin/{ticket_id}", response_model=TicketResponse)
async def update_ticket_admin(
    ticket_id: str,
    payload: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Admin - Update ticket status or priority."""
    _check_admin(current_user)
    
    result = await db.execute(select(SupportTicket).filter(SupportTicket.id == uuid.UUID(ticket_id)))
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if payload.status:
        ticket.status = payload.status
    if payload.priority:
        ticket.priority = payload.priority
        
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        category=ticket.category,
        messages=ticket.messages,
        created_at=ticket.created_at.isoformat() if ticket.created_at else "",
        updated_at=ticket.updated_at.isoformat() if ticket.updated_at else None
    )
