---
description: Repository Information Overview
alwaysApply: true
---

# Mindscape Information

## Summary
Mindscape is a comprehensive mental health platform for college students combining modern web technologies with AI-powered support. It provides features like AI chatbot with crisis detection, counselor booking, peer support forum, educational resources, and analytics.

## Structure
- **backend/**: Django REST API backend with MongoDB integration
- **frontend/**: React TypeScript frontend with Vite and TailwindCSS
- **scripts/**: Deployment and setup scripts for different environments
- **.zencoder/**: Configuration for Zencoder integration

## Repository Components
- **Backend API**: Django-based REST API with WebSocket support
- **Frontend App**: React SPA with modern UI components
- **Docker Configuration**: Containerization for all services
- **Deployment Scripts**: Windows and Docker deployment options

## Projects

### Backend (Django)
**Configuration File**: backend/mindscape_backend/settings.py

#### Language & Runtime
**Language**: Python
**Version**: 3.10 (specified in Dockerfile)
**Framework**: Django 3.2.25
**Database ORM**: Djongo 1.3.6 (MongoDB integration)

#### Dependencies
**Main Dependencies**:
- Django 3.2.25
- Django REST Framework 3.14.0
- Djongo 1.3.6 (MongoDB ORM)
- Channels 3.0.5 (WebSockets)
- Redis 5.0.1 (Caching/Channels)
- PyMongo 4.6.0

#### Build & Installation
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Docker
**Dockerfile**: backend/Dockerfile
**Image**: Python 3.10-slim based
**Configuration**: Multi-container setup with MongoDB, Redis, Django, Celery
**Run Command**:
```bash
cd backend
docker-compose up -d
```

#### Testing
**Framework**: Django Test Framework
**Test Location**: Each app has tests/ directory
**Run Command**:
```bash
python manage.py test
```

### Frontend (React)
**Configuration File**: frontend/package.json

#### Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.8.3
**Framework**: React 18.3.1
**Build Tool**: Vite 5.4.19

#### Dependencies
**Main Dependencies**:
- React 18.3.1
- React Router 6.30.1
- TanStack Query 5.83.0
- Radix UI Components
- TailwindCSS 3.4.17
- Supabase JS 2.57.4

#### Build & Installation
```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
```

#### Docker
Not directly containerized, but can be served from the Django container's static files after building.

## Infrastructure

### Database
- MongoDB 7.0 (containerized)
- Connection via Djongo ORM
- MongoDB Atlas for production

### Caching & Messaging
- Redis 7.2 for caching and WebSocket channels
- Celery for background tasks
- Celery Beat for scheduled tasks

### API
- RESTful API with Django REST Framework
- JWT Authentication
- WebSocket support via Django Channels
- OpenAI integration for AI features

### Deployment
- Docker Compose for local development
- Containerized services for production
- Environment variable configuration
- Static file serving with Whitenoise