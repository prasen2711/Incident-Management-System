output "backend_url" {
  description = "The URL of the Backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_bucket_url" {
  description = "The URL of the Frontend hosted on GCS"
  value       = "https://storage.googleapis.com/${google_storage_bucket.frontend_bucket.name}/index.html"
}

output "storage_bucket_name" {
  description = "The name of the GCS bucket"
  value       = google_storage_bucket.frontend_bucket.name
}
