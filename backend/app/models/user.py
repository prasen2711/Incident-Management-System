import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="staff") # admin, support, staff
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Additional Profile Fields
    department = Column(String, nullable=True)
    employee_id = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    # Support Agent Specific Fields
    area_of_expertise = Column(String, nullable=True)
    
    # Approval Workflow Fields
    approval_status = Column(String, nullable=False, default="approved") # pending, approved, rejected
    rejection_reason = Column(String, nullable=True)
