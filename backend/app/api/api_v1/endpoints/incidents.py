from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.api import deps
from app.db.session import get_db
from app.models.incident import Incident, IncidentNote, Attachment
from app.models.user import User
from app.schemas.incident import Incident as IncidentSchema, IncidentCreate, IncidentUpdate, IncidentWithDetails, IncidentNoteCreate, IncidentNote as IncidentNoteSchema

router = APIRouter()

@router.get("/", response_model=List[IncidentSchema])
async def read_incidents(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    query = select(Incident).offset(skip).limit(limit)
    if current_user.role == "staff":
        query = query.where(Incident.creator_id == current_user.id)
    elif current_user.role == "support":
        query = query.where((Incident.assignee_id == current_user.id) | (Incident.creator_id == current_user.id))
        
    result = await db.execute(query)
    return result.scalars().all()

from app.services.email_service import send_new_ticket_created_email, send_ticket_assigned_email
from app.core.config import settings

@router.post("/", response_model=IncidentSchema)
async def create_incident(
    *,
    db: AsyncSession = Depends(get_db),
    incident_in: IncidentCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    db_obj = Incident(
        title=incident_in.title,
        description=incident_in.description,
        status=incident_in.status,
        priority=incident_in.priority,
        category=incident_in.category,
        creator_id=current_user.id,
        assignee_id=incident_in.assignee_id
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    
    # Notify Admin
    send_new_ticket_created_email(settings.ADMIN_EMAIL, db_obj.title, current_user.full_name)
    
    return db_obj

@router.get("/{id}", response_model=IncidentWithDetails)
async def read_incident(
    *,
    db: AsyncSession = Depends(get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(
        select(Incident)
        .options(selectinload(Incident.notes), selectinload(Incident.attachments))
        .where(Incident.id == id)
    )
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if current_user.role == "staff" and incident.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return incident

@router.post("/{id}/notes", response_model=IncidentNoteSchema)
async def add_incident_note(
    *,
    db: AsyncSession = Depends(get_db),
    id: UUID,
    note_in: IncidentNoteCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Incident).where(Incident.id == id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    db_obj = IncidentNote(
        incident_id=id,
        user_id=current_user.id,
        note_text=note_in.note_text
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.put("/{id}", response_model=IncidentSchema)
async def update_incident(
    *,
    db: AsyncSession = Depends(get_db),
    id: UUID,
    incident_in: IncidentUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Incident).where(Incident.id == id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if current_user.role == "staff" and incident.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    old_assignee = incident.assignee_id
    update_data = incident_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
        
    db.add(incident)
    await db.commit()
    await db.refresh(incident)
    
    # If newly assigned, notify the new agent
    if update_data.get("assignee_id") and update_data.get("assignee_id") != old_assignee:
        agent_result = await db.execute(select(User).where(User.id == update_data["assignee_id"]))
        agent = agent_result.scalars().first()
        if agent:
            send_ticket_assigned_email(agent.email, incident.title)
            
    return incident
