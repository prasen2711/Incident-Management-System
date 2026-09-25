from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ArticleBase(BaseModel):
    title: str
    content: str
    category: str

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class ArticleInDBBase(ArticleBase):
    id: UUID
    author_id: UUID
    views: int
    created_at: datetime

    class Config:
        from_attributes = True

class Article(ArticleInDBBase):
    pass
