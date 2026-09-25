import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True)
    report_type = Column(String, nullable=False)  # 'postmortem', 'summary', 'analytics'
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    storage_url = Column(Text, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident")
    generator = relationship("User")
