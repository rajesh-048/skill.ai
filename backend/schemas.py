from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserRegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "student"
    full_name: str
    education_level: Optional[str] = "B.Tech"
    branch: Optional[str] = "Computer Science and Engineering"
    semester: Optional[int] = 4
    career_goal: Optional[str] = "AI/ML Engineer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class DemoLoginRequest(BaseModel):
    role: str # student, instructor, admin

# --- Student Profile & Onboarding ---
class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    education_level: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    career_goal: Optional[str] = None
    preferred_learning_style: Optional[str] = None
    daily_learning_time_min: Optional[int] = None
    bio: Optional[str] = None
    skills: Optional[List[Dict[str, Any]]] = None # [{"name": "Python", "rating": "advanced"}]

class OnboardingRequest(BaseModel):
    name: str
    education_level: str
    branch: str
    semester: int
    career_goal: str
    skills: List[Dict[str, str]] # [{"name": "Python", "rating": "advanced"}, {"name": "ML", "rating": "beginner"}]
    preferred_learning_style: str = "Visual / Practical Projects"
    daily_learning_time_min: int = 60

# --- Quiz Schemas ---
class QuizGenerateRequest(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None
    document_id: Optional[str] = None
    course_id: Optional[str] = None
    difficulty: str = "Medium" # Easy, Medium, Hard
    question_count: int = 5
    question_type: str = "mcq" # mcq, true_false, short_answer

class QuestionAnswerSubmission(BaseModel):
    question_id: str
    user_answer: str

class QuizSubmitRequest(BaseModel):
    answers: List[QuestionAnswerSubmission]
    time_spent_seconds: int = 60

# --- AI Chat & Mentor ---
class AIChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None
    session_id: Optional[str] = "default"
    include_learning_context: bool = True

class AIChatResponse(BaseModel):
    reply: str
    citations: List[Dict[str, Any]] = []
    suggested_questions: List[str] = []
    recommended_topics: List[str] = []

# --- Recommendations ---
class RecommendationItem(BaseModel):
    id: str
    item_type: str
    title: str
    description: str
    score: float
    priority_rank: int
    why_explanation: str
    is_completed: bool

# --- iGOT Sync ---
class IGOTSyncRequest(BaseModel):
    sync_direction: str = "bidirectional" # pull, push, bidirectional
    module_filter: Optional[str] = "all"
