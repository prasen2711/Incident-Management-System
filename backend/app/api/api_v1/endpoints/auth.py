import uuid
from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.core import security, config
from app.db.session import get_db
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import User as UserSchema, UserRegister

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> dict:

    from fastapi.concurrency import run_in_threadpool
    
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    is_password_correct = await run_in_threadpool(
        security.verify_password, form_data.password, user.hashed_password
    )
    
    if not is_password_correct:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Handle pending approvals
    if not user.is_active:
        if user.role == "support" and user.approval_status == "pending":
            raise HTTPException(status_code=403, detail="Account pending admin approval")
        elif user.approval_status == "rejected":
            raise HTTPException(status_code=403, detail=f"Account rejected: {user.rejection_reason}")
        else:
            raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.id, user.role),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
async def register_user(
    user_in: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    if user_in.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot register as admin")
        
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    is_active = True
    approval_status = "approved"
    
    if user_in.role == "support":
        is_active = False
        approval_status = "pending"

    hashed_password = security.get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=is_active,
        department=user_in.department,
        employee_id=user_in.employee_id,
        phone_number=user_in.phone_number,
        area_of_expertise=user_in.area_of_expertise,
        approval_status=approval_status
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

from app.schemas.user import ForgotPassword, ResetPassword
from app.services.email_service import send_password_reset_email
from jose import jwt, JWTError

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPassword,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    if not user:
        # For security, do not reveal if email exists, just return 200
        return {"msg": "If an account with that email exists, a reset link has been sent."}
    
    # Create a 15-minute reset token
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(user.id), "role": "reset"}
    encoded_jwt = jwt.encode(to_encode, config.settings.SECRET_KEY, algorithm=config.settings.ALGORITHM)
    
    # Send email
    send_password_reset_email(user.email, encoded_jwt)
    return {"msg": "If an account with that email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    data: ResetPassword,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(data.token, config.settings.SECRET_KEY, algorithms=[config.settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if role != "reset" or user_id is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = security.get_password_hash(data.new_password)
    user.hashed_password = hashed_password
    db.add(user)
    await db.commit()
    
    return {"msg": "Password updated successfully"}
