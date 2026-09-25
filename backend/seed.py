import asyncio
import uuid
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@localhost:5432/ims")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = [
    {
        "email": "admin@company.com",
        "password": "admin123",
        "full_name": "System Admin",
        "role": "admin",
    }
]

async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_maker() as session:
        for u in USERS:
            result = await session.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": u["email"]}
            )
            existing = result.fetchone()
            if existing:
                print(f"⏩  User already exists: {u['email']}")
                continue

            hashed = pwd_context.hash(u["password"])
            await session.execute(
                text("""
                    INSERT INTO users (id, email, hashed_password, full_name, role, is_active, created_at, approval_status)
                    VALUES (:id, :email, :hashed_password, :full_name, :role, :is_active, :created_at, :approval_status)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "email": u["email"],
                    "hashed_password": hashed,
                    "full_name": u["full_name"],
                    "role": u["role"],
                    "is_active": True,
                    "created_at": datetime.utcnow(),
                    "approval_status": "approved",
                }
            )
            print(f"✅  Created: {u['email']}  (password: {u['password']})")

        await session.commit()

    await engine.dispose()
    print("\n🎉  Seed complete! You can now log in.")

if __name__ == "__main__":
    asyncio.run(seed())
