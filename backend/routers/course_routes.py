import uuid
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.services.auth_service import get_current_user
from backend.services.competency_service import recalculate_user_competencies

router = APIRouter(prefix="/courses", tags=["Course Management"])

@router.get("")
async def get_courses(category: str = None, level: str = None):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT c.*, p.full_name as instructor_name
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE c.is_published = 1
        """
        params = []
        if category:
            query += " AND c.category = ?"
            params.append(category)
        if level:
            query += " AND c.level = ?"
            params.append(level)
            
        query += " ORDER BY c.enrolled_count DESC"
        cursor.execute(query, params)
        return [dict(r) for r in cursor.fetchall()]

@router.get("/{id_or_slug}")
async def get_course_detail(id_or_slug: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, p.full_name as instructor_name, p.bio as instructor_bio
            FROM courses c
            JOIN users u ON c.instructor_id = u.id
            JOIN profiles p ON u.id = p.user_id
            WHERE c.id = ? OR c.slug = ?
        """, (id_or_slug, id_or_slug))
        course_row = cursor.fetchone()
        if not course_row:
            raise HTTPException(status_code=404, detail="Course not found")
        course = dict(course_row)
        
        # Fetch modules & lessons
        cursor.execute("SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_num ASC", (course["id"],))
        modules = [dict(m) for m in cursor.fetchall()]
        
        for mod in modules:
            cursor.execute("SELECT * FROM lessons WHERE module_id = ? ORDER BY order_num ASC", (mod["id"],))
            mod["lessons"] = [dict(l) for l in cursor.fetchall()]
            
        course["modules"] = modules
        return course

@router.post("/{course_id}/enroll")
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM courses WHERE id = ?", (course_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Course not found")
            
        cursor.execute("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", (user_id, course_id))
        if cursor.fetchone():
            return {"status": "success", "message": "Already enrolled in this course."}
            
        cursor.execute("""
            INSERT INTO enrollments (id, user_id, course_id, progress_percentage, status)
            VALUES (?, ?, ?, 5.0, 'in_progress')
        """, (str(uuid.uuid4()), user_id, course_id))
        
        cursor.execute("UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?", (course_id,))
        
    return {"status": "success", "message": "Successfully enrolled in course!"}

@router.put("/{course_id}/progress")
async def update_progress(course_id: str, payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    progress = float(payload.get("progress_percentage", 50.0))
    user_id = current_user["id"]
    
    with get_db() as conn:
        cursor = conn.cursor()
        status_val = "completed" if progress >= 100.0 else "in_progress"
        cursor.execute("""
            UPDATE enrollments
            SET progress_percentage = ?, status = ?, completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE user_id = ? AND course_id = ?
        """, (progress, status_val, progress, user_id, course_id))
        
    recalculate_user_competencies(user_id)
    return {"status": "success", "progress_percentage": progress, "status_label": status_val}
