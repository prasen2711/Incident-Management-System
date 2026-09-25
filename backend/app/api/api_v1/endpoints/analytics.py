from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from app.api import deps
from app.db.session import get_db
from app.models.incident import Incident
from app.models.user import User

router = APIRouter()

@router.get("/dashboard", response_model=dict)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Admin and Support can see overall stats. Staff only sees their own.
    
    query = select(Incident.status, func.count(Incident.id)).group_by(Incident.status)
    if current_user.role == "staff":
        query = query.where(Incident.creator_id == current_user.id)
        
    result = await db.execute(query)
    status_counts = dict(result.all())
    
    priority_query = select(Incident.priority, func.count(Incident.id)).group_by(Incident.priority)
    if current_user.role == "staff":
        priority_query = priority_query.where(Incident.creator_id == current_user.id)
        
    priority_result = await db.execute(priority_query)
    priority_counts = dict(priority_result.all())
    
    return {
        "status_distribution": status_counts,
        "priority_distribution": priority_counts,
        "total_incidents": sum(status_counts.values())
    }
