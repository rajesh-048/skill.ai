import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.config import settings, UPLOAD_DIR
from backend.database import init_db, get_db
from backend.services.seed_service import seed_database

# Routers
from backend.routers.auth_routes import router as auth_router
from backend.routers.student_routes import router as student_router
from backend.routers.instructor_routes import router as instructor_router
from backend.routers.admin_routes import router as admin_router
from backend.routers.document_routes import router as document_router
from backend.routers.quiz_routes import router as quiz_router
from backend.routers.ai_routes import router as ai_router
from backend.routers.course_routes import router as course_router
from backend.routers.igot_routes import router as igot_router
from backend.routers.competency_interview_routes import router as competency_interview_router

app = FastAPI(
    title="SkillSphere AI",
    description="MoSPI SIH26101 - AI-Powered Competency Gap Identification & Personalized Learning System",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()
    seed_database(force=False)

@app.get("/")
async def root():
    return {
        "product": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "organization": settings.ORGANIZATION,
        "problem_id": settings.PROBLEM_ID,
        "status": "Online & Operational",
        "demo_mode": settings.DEMO_MODE,
        "api_docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode_active": True
    }

@app.get("/api/search")
async def global_search(q: str = ""):
    query = q.lower().strip()
    if not query:
        return {"courses": [], "documents": [], "skills": [], "quizzes": []}
        
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Search Courses
        cursor.execute("SELECT id, title, category, level, thumbnail_url FROM courses WHERE LOWER(title) LIKE ? OR LOWER(description) LIKE ? LIMIT 5", (f"%{query}%", f"%{query}%"))
        courses = [dict(r) for r in cursor.fetchall()]
        
        # Search Documents
        cursor.execute("SELECT id, title, file_type, page_count FROM documents WHERE LOWER(title) LIKE ? LIMIT 5", (f"%{query}%",))
        documents = [dict(r) for r in cursor.fetchall()]
        
        # Search Skills
        cursor.execute("SELECT id, name, category, description FROM skills WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? LIMIT 5", (f"%{query}%", f"%{query}%"))
        skills = [dict(r) for r in cursor.fetchall()]
        
        # Search Quizzes
        cursor.execute("SELECT id, title, difficulty, total_questions FROM quizzes WHERE LOWER(title) LIKE ? LIMIT 5", (f"%{query}%",))
        quizzes = [dict(r) for r in cursor.fetchall()]
        
        return {
            "query": query,
            "courses": courses,
            "documents": documents,
            "skills": skills,
            "quizzes": quizzes
        }

# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(student_router, prefix=settings.API_V1_PREFIX)
app.include_router(instructor_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(document_router, prefix=settings.API_V1_PREFIX)
app.include_router(quiz_router, prefix=settings.API_V1_PREFIX)
app.include_router(ai_router, prefix=settings.API_V1_PREFIX)
app.include_router(course_router, prefix=settings.API_V1_PREFIX)
app.include_router(igot_router, prefix=settings.API_V1_PREFIX)
app.include_router(competency_interview_router, prefix=settings.API_V1_PREFIX)

# Static files mounting for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
