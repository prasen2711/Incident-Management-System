# Enterprise Incident Management System (IMS)

An enterprise-grade Incident Management System featuring a modern Angular frontend, scalable FastAPI backend, AI-powered report generation, Supabase database + storage, and a robust Continuous Integration / Site Reliability Engineering (SRE) pipeline deployed on Google Cloud Run.

## ✨ Features
- **Role-Based Access**: Admin, Support Agent, and Staff portals.
- **Incident Tracking**: Create, assign, update, and resolve incidents with priorities and categories.
- **AI Analytics & Reporting**: Automatic PDF generation for Post-Mortems, Incident Summaries, and Monthly Analytics using **Google Gemini AI**.
- **Internal Knowledge Base**: Help staff resolve issues independently.
- **Email Notifications**: Gmail SMTP integration.
- **Mobile Responsive UI**: Built with Angular and vanilla CSS.
- **Enterprise DevOps & SRE**: Deep database health checks, structured JSON logging, and Non-Root Multi-Stage Docker builds.
- **Continuous Integration**: Automated CI pipeline via GitHub Actions for linting, pytest integration testing, and SonarQube scanning.

## 🏗 Architecture
- **Frontend**: Angular 18 (TypeScript, RxJS).
- **Backend**: FastAPI, SQLAlchemy, Pydantic, Alembic (Python 3.11, Async).
- **Database**: PostgreSQL (Hosted on **Supabase** Free Tier).
- **Storage**: **Supabase Storage** (For user attachments and AI PDF reports).
- **AI Engine**: Google Gemini API (1.5 Flash).
- **Infrastructure**: Docker, Multi-Stage builds, GitHub Actions, Google Cloud Run (Serverless).

## 🛠 Prerequisites
- Docker & Docker Compose
- Google Gemini API Key
- Supabase Project (Database URL & Service Role Key)
- Gmail App Password (for email features)
- Google Cloud CLI (for production deployment)

## 🚀 Local Setup (Docker)

1. Get your API keys:
   - Create a free [Gemini API Key](https://aistudio.google.com/app/apikey).
   - Create a free [Supabase Project](https://supabase.com). Copy the Database URL and Service Role Key. Create two private storage buckets: `attachments` and `reports`.

2. Copy `.env.example` to `.env` in the `backend` directory and fill in your keys:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:password@aws-0-region.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-key
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

4. Access the system:
   - **Frontend App**: `http://localhost:8080`
   - **Backend API Docs**: `http://localhost:8000/docs`

## ☁️ Deployment
This application is designed for serverless container deployment via **Google Cloud Run**.

**Backend Deployment:**
```bash
gcloud run deploy ims-backend --source . --region us-central1 --allow-unauthenticated --port 8000
```

**Frontend Deployment (Runs securely on Port 8080):**
```bash
gcloud run deploy ims-frontend --source . --region us-central1 --allow-unauthenticated --port 8080
```
