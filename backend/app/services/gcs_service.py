from google.cloud import storage
from fastapi import UploadFile
import uuid
from app.core.config import settings

def upload_file_to_gcs(file: UploadFile) -> str:
    """
    Uploads a file to Google Cloud Storage and returns the public URL.
    Note: Requires GCP credentials to be configured in the environment.
    """
    try:
        client = storage.Client(project=settings.GCP_PROJECT_ID)
        bucket = client.bucket(settings.GCP_BUCKET_NAME)
        
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        blob = bucket.blob(unique_filename)
        blob.upload_from_file(file.file, content_type=file.content_type)
        
        # In a real enterprise setup, we might return a signed URL or serve via CDN.
        # For simplicity, returning the standard GCS URL format.
        return f"https://storage.googleapis.com/{settings.GCP_BUCKET_NAME}/{unique_filename}"
    except Exception as e:
        # Fallback for local development if GCP is not configured yet
        print(f"Failed to upload to GCS: {e}")
        return f"http://localhost:8000/mock-uploads/{file.filename}"
