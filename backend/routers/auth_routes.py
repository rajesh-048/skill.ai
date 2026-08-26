import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from backend.database import get_db
from backend.schemas import UserLoginRequest, UserRegisterRequest, TokenResponse, DemoLoginRequest
from backend.services.auth_service import (
    authenticate_user, create_access_token, get_current_user,
    hash_password, get_user_by_email, get_user_by_id
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEMO_ACCOUNTS = {
    "student": "demo.student@skillsphere.ai",
    "instructor": "demo.instructor@skillsphere.ai",
    "admin": "demo.admin@skillsphere.ai"
}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLoginRequest):
    user = authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials or use Demo Login."
        )
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest):
    role = req.role.lower().strip()
    if role not in DEMO_ACCOUNTS:
        raise HTTPException(status_code=400, detail=f"Invalid demo role: {role}. Must be student, instructor, or admin.")
    email = DEMO_ACCOUNTS[role]
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found in database. Please run seed script.")
    full_user = get_user_by_id(user["id"])
    token = create_access_token({"sub": user["id"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": full_user
    }

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    existing = get_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")
        
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(req.password)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, email, hashed_password, role)
            VALUES (?, ?, ?, ?)
        """, (user_id, req.email.lower().strip(), hashed_pwd, req.role.lower()))
        
        profile_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO profiles (
                id, user_id, full_name, education_level, branch, semester, career_goal,
                preferred_learning_style, daily_learning_time_min
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Interactive AI Practice', 60)
        """, (profile_id, user_id, req.full_name, req.education_level, req.branch, req.semester, req.career_goal))
        
        # Link initial baseline skills
        default_skills = ["skill_py", "skill_dsa", "skill_sql", "skill_ml"]
        for s_id in default_skills:
            cursor.execute("""
                INSERT OR IGNORE INTO user_skills (
                    id, user_id, skill_id, self_rating, quiz_score, assessment_score,
                    course_completion, learning_activity, competency_score, gap_level
                ) VALUES (?, ?, ?, 'beginner', 30.0, 30.0, 0.0, 20.0, 30.0, 'critical')
            """, (str(uuid.uuid4()), user_id, s_id))
            
    full_user = get_user_by_id(user_id)
    token = create_access_token({"sub": user_id, "role": req.role.lower()})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": full_user
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
