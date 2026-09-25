from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from datetime import datetime

from app.api import deps
from app.db.session import get_db
from app.models.incident import Incident, IncidentNote
from app.models.user import User
from app.models.report import Report
from app.schemas.report import ReportOut
from app.services import report_service

router = APIRouter()

# ─────────────────────────────────────────────
# GET: List all reports for an incident
# ─────────────────────────────────────────────
@router.get("/incident/{incident_id}", response_model=List[ReportOut])
async def list_reports(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(
        select(Report)
        .where(Report.incident_id == incident_id)
        .order_by(Report.created_at.desc())
    )
    return result.scalars().all()

# ─────────────────────────────────────────────
# POST: Generate Post-Mortem (Admin + Support)
# ─────────────────────────────────────────────
@router.post("/incident/{incident_id}/postmortem", response_model=ReportOut)
async def generate_postmortem(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.role not in ["admin", "support"]:
        raise HTTPException(status_code=403, detail="Only admins and support agents can generate post-mortem reports")

    # Fetch incident
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Support can only generate for their assigned tickets
    if current_user.role == "support" and incident.assignee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only generate reports for your assigned tickets")

    # Fetch notes
    notes_result = await db.execute(
        select(IncidentNote).where(IncidentNote.incident_id == incident_id).order_by(IncidentNote.created_at)
    )
    notes = notes_result.scalars().all()

    # Fetch creator and assignee names
    creator_result = await db.execute(select(User).where(User.id == incident.creator_id))
    creator = creator_result.scalars().first()
    assignee_name = "Unassigned"
    if incident.assignee_id:
        assignee_result = await db.execute(select(User).where(User.id == incident.assignee_id))
        assignee = assignee_result.scalars().first()
        if assignee:
            assignee_name = assignee.full_name

    creator_name = creator.full_name if creator else "Unknown"

    # Build prompt and generate
    prompt = report_service.build_postmortem_prompt(incident, notes, creator_name, assignee_name)
    file_name = f"postmortem_{incident_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

    try:
        url = report_service.generate_and_upload_report(
            prompt=prompt,
            pdf_title=incident.title,
            pdf_subtitle=f"Category: {incident.category} | Priority: {incident.priority.upper()} | Status: {incident.status.replace('_', ' ').title()}",
            report_type="Post-Mortem",
            file_name=file_name
        )
    except Exception as e:
        error_msg = f"Report generation failed: {repr(e)}"
        import logging
        logging.getLogger(__name__).error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

    # Save record to DB
    db_report = Report(
        incident_id=incident_id,
        report_type="postmortem",
        generated_by=current_user.id,
        storage_url=url,
        file_name=file_name
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report

# ─────────────────────────────────────────────
# POST: Generate Summary (All roles — staff: own ticket only)
# ─────────────────────────────────────────────
@router.post("/incident/{incident_id}/summary", response_model=ReportOut)
async def generate_summary(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalars().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Staff can only generate for their own tickets
    if current_user.role == "staff" and incident.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only generate summaries for your own tickets")

    creator_result = await db.execute(select(User).where(User.id == incident.creator_id))
    creator = creator_result.scalars().first()
    creator_name = creator.full_name if creator else "Unknown"

    prompt = report_service.build_summary_prompt(incident, creator_name)
    file_name = f"summary_{incident_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

    print(f"[DEBUG] summary endpoint: Incident {incident_id} found. Calling generate_and_upload_report...")
    import sys
    sys.stdout.flush()
    try:
        url = report_service.generate_and_upload_report(
            prompt=prompt,
            pdf_title=incident.title,
            pdf_subtitle=f"Incident Summary | Raised by: {creator_name}",
            report_type="Summary",
            file_name=file_name
        )
        print(f"[DEBUG] summary endpoint: generate_and_upload_report returned URL: {url}")
        sys.stdout.flush()
    except Exception as e:
        print(f"[DEBUG] summary endpoint: CAUGHT EXCEPTION: {repr(e)}")
        sys.stdout.flush()
        error_msg = f"Summary generation failed: {repr(e)}"
        import logging
        logging.getLogger(__name__).error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

    db_report = Report(
        incident_id=incident_id,
        report_type="summary",
        generated_by=current_user.id,
        storage_url=url,
        file_name=file_name
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report

# ─────────────────────────────────────────────
# POST: Generate Monthly Analytics Report (Admin only)
# ─────────────────────────────────────────────
@router.post("/analytics/monthly", response_model=ReportOut)
async def generate_monthly_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can generate analytics reports")

    # Gather stats
    result = await db.execute(select(Incident))
    all_incidents = result.scalars().all()

    from collections import Counter
    statuses = Counter(i.status for i in all_incidents)
    priorities = Counter(i.priority for i in all_incidents)
    categories = Counter(i.category for i in all_incidents)

    stats = {
        "total": len(all_incidents),
        "open": statuses.get("open", 0),
        "in_progress": statuses.get("in_progress", 0),
        "resolved": statuses.get("resolved", 0),
        "closed": statuses.get("closed", 0),
        "critical": priorities.get("critical", 0),
        "high": priorities.get("high", 0),
        "medium": priorities.get("medium", 0),
        "low": priorities.get("low", 0),
        "by_category": ", ".join([f"{k}: {v}" for k, v in categories.most_common(5)])
    }

    prompt = report_service.build_analytics_prompt(stats)
    file_name = f"analytics_monthly_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"

    try:
        url = report_service.generate_and_upload_report(
            prompt=prompt,
            pdf_title="Monthly Incident Analytics Report",
            pdf_subtitle=f"Total Incidents: {stats['total']} | Generated: {datetime.utcnow().strftime('%B %Y')}",
            report_type="Analytics",
            file_name=file_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    db_report = Report(
        incident_id=None,
        report_type="analytics",
        generated_by=current_user.id,
        storage_url=url,
        file_name=file_name
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    return db_report
