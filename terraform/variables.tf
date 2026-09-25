variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region to deploy resources to"
  type        = string
  default     = "asia-south1"
}

variable "database_url" {
  description = "Supabase PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "Secret key for JWT authentication"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase API URL"
  type        = string
}

variable "supabase_service_key" {
  description = "Supabase Service Role Key"
  type        = string
  sensitive   = true
}

variable "gemini_api_key" {
  description = "Google Gemini API Key"
  type        = string
  sensitive   = true
}

variable "frontend_bucket_name" {
  description = "Name of the GCS bucket for frontend hosting"
  type        = string
  default     = "ims-frontend-prod-v2"
}
