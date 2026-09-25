from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "staff"
    is_active: Optional[bool] = True
    department: Optional[str] = None
    employee_id: Optional[str] = None
    phone_number: Optional[str] = None
    area_of_expertise: Optional[str] = None
    approval_status: Optional[str] = "approved"
    rejection_reason: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str
    department: Optional[str] = None
    employee_id: Optional[str] = None
    phone_number: Optional[str] = None
    area_of_expertise: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None
    department: Optional[str] = None
    employee_id: Optional[str] = None
    phone_number: Optional[str] = None
    area_of_expertise: Optional[str] = None
    approval_status: Optional[str] = None
    rejection_reason: Optional[str] = None

class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str
