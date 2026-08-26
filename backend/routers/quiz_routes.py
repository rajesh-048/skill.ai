from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.services.auth_service import get_current_user
from backend.services.quiz_service import create_quiz_with_ai, get_quiz_details, evaluate_and_submit_quiz
from backend.schemas import QuizGenerateRequest, QuizSubmitRequest

router = APIRouter(prefix="/quizzes", tags=["Quiz & Assessments"])

@router.post("/generate")
async def generate_quiz(payload: QuizGenerateRequest, current_user: dict = Depends(get_current_user)):
    try:
        quiz = create_quiz_with_ai(
            user_id=current_user["id"],
            topic=payload.topic,
            document_id=payload.document_id,
            course_id=payload.course_id,
            difficulty=payload.difficulty,
            question_count=payload.question_count,
            question_type=payload.question_type,
            title=payload.title
        )
        return {
            "status": "success",
            "message": f"Successfully generated {quiz['total_questions']} {quiz['difficulty']}-level questions.",
            "quiz": quiz
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate quiz at this time. Please try again. ({str(e)})"
        )

@router.get("")
async def list_quizzes(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT q.*, s.name as skill_name, d.title as document_title, c.title as course_title
            FROM quizzes q
            LEFT JOIN skills s ON q.skill_id = s.id
            LEFT JOIN documents d ON q.document_id = d.id
            LEFT JOIN courses c ON q.course_id = c.id
            ORDER BY q.created_at DESC
            LIMIT 20
        """)
        return [dict(r) for r in cursor.fetchall()]

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: str, current_user: dict = Depends(get_current_user)):
    quiz = get_quiz_details(quiz_id, include_answers=False)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, payload: QuizSubmitRequest, current_user: dict = Depends(get_current_user)):
    try:
        submissions = [{"question_id": a.question_id, "user_answer": a.user_answer} for a in payload.answers]
        result = evaluate_and_submit_quiz(
            user_id=current_user["id"],
            quiz_id=quiz_id,
            submissions=submissions,
            time_spent_seconds=payload.time_spent_seconds
        )
        return {
            "status": "success",
            "message": f"Assessment completed. You scored {result['score']}/{result['total_questions']} ({result['percentage']}%).",
            "result": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission processing failed: {str(e)}")

@router.get("/history/attempts")
async def get_quiz_attempts(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT qa.*, q.title as quiz_title, q.difficulty as quiz_difficulty
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.user_id = ?
            ORDER BY qa.created_at DESC
        """, (current_user["id"],))
        return [dict(r) for r in cursor.fetchall()]
