from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.api import deps
from app.db.session import get_db
from app.models.incident import Incident, Attachment
from app.models.user import User
from app.schemas.incident import Attachment as AttachmentSchema
from app.services.supabase_service import upload_file_to_supabase

router = APIRouter()

@router.post("/incident/{incident_id}", response_model=AttachmentSchema)
async def upload_attachment(
    *,
    db: AsyncSession = Depends(get_db),
    incident_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    file_bytes = await file.read()
    safe_name = f"{incident_id}/{file.filename}"
    file_url = upload_file_to_supabase(file_bytes, safe_name, bucket="attachments")

    db_obj = Attachment(
        incident_id=incident_id,
        file_name=file.filename,
        file_url=file_url,
        uploaded_by=current_user.id
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

