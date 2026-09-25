import logging
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client | None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Supabase credentials not configured.")
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def upload_file_to_supabase(file_bytes: bytes, file_name: str, bucket: str = "attachments") -> str:
    """Upload a file to Supabase Storage and return the public URL."""
    client = get_supabase_client()
    if not client:
        raise Exception("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")

    path = f"{file_name}"
    client.storage.from_(bucket).upload(
        path=path,
        file=file_bytes,
        file_options={"upsert": "true"}
    )
    public_url = client.storage.from_(bucket).get_public_url(path)
    return public_url

def upload_pdf_to_supabase(pdf_bytes: bytes, file_name: str) -> str:
    """Upload a PDF report to the 'reports' bucket and return the public URL."""
    client = get_supabase_client()
    if not client:
        raise Exception("Supabase is not configured.")

    path = f"{file_name}"
    client.storage.from_("reports").upload(
        path=path,
        file=pdf_bytes,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )
    public_url = client.storage.from_("reports").get_public_url(path)
    return public_url
