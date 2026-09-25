from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.api import deps
from app.db.session import get_db
from app.models.article import Article
from app.models.user import User
from app.schemas.article import Article as ArticleSchema, ArticleCreate

router = APIRouter()

@router.get("/", response_model=List[ArticleSchema])
async def read_articles(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Any authenticated user can read articles
    query = select(Article).order_by(Article.views.desc(), Article.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ArticleSchema)
async def create_article(
    *,
    db: AsyncSession = Depends(get_db),
    article_in: ArticleCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Only support agents and admins can create articles
    if current_user.role not in ["support", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    
    try:
        db_obj = Article(
            title=article_in.title,
            content=article_in.content,
            category=article_in.category,
            author_id=current_user.id
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database Error: {str(e)}"
        )

@router.put("/{id}/views", response_model=ArticleSchema)
async def increment_article_views(
    *,
    db: AsyncSession = Depends(get_db),
    id: UUID,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Article).where(Article.id == id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    article.views += 1
    db.add(article)
    await db.commit()
    await db.refresh(article)
    return article
