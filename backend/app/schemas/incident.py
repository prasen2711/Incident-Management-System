from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class IncidentBase(BaseModel):
    title: str
    description: str
    status: Optional[str] = "open"
    priority: Optional[str] = "medium"
    category: str
    assignee_id: Optional[UUID] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assignee_id: Optional[UUID] = None

class IncidentInDBBase(IncidentBase):
    id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Incident(IncidentInDBBase):
    pass

class IncidentNoteBase(BaseModel):
    note_text: str

class IncidentNoteCreate(IncidentNoteBase):
    pass

class IncidentNote(IncidentNoteBase):
    id: UUID
    incident_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class AttachmentBase(BaseModel):
    file_name: str
    file_url: str

class AttachmentCreate(AttachmentBase):
    pass

class Attachment(AttachmentBase):
    id: UUID
    incident_id: UUID
    uploaded_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentWithDetails(Incident):
    notes: List[IncidentNote] = []
    attachments: List[Attachment] = []
