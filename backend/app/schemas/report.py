from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    report_type: str
    storage_url: str
    file_name: str

class ReportOut(ReportBase):
    id: UUID
    incident_id: Optional[UUID] = None
    generated_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True
