from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, incidents, uploads, analytics, articles, reports

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(articles.router, prefix="/articles", tags=["articles"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
