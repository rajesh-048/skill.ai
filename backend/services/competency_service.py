import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.database import get_db

DEFAULT_WEIGHTS = {
    "quiz": 0.30,
    "assessment": 0.20,
    "course": 0.20,
    "self": 0.15,
    "activity": 0.15
}

def self_rating_to_score(rating: str) -> float:
    rating_lower = str(rating).lower().strip()
    if "advanced" in rating_lower or "expert" in rating_lower:
        return 90.0
    elif "intermediate" in rating_lower or "proficient" in rating_lower:
        return 65.0
    elif "beginner" in rating_lower or "novice" in rating_lower:
        return 30.0
    return 30.0

def classify_gap(score: float) -> Dict[str, str]:
    if score < 40.0:
        return {
            "level": "critical",
            "label": "Beginner / Critical Gap",
            "color": "#EF4444", # Red
            "urgency": "High",
            "action": "Immediate foundational training & practice required"
        }
    elif score < 60.0:
        return {
            "level": "developing",
            "label": "Developing",
            "color": "#F97316", # Orange
            "urgency": "Medium",
            "action": "Needs structured exercises and intermediate modules"
        }
    elif score < 80.0:
        return {
            "level": "proficient",
            "label": "Proficient",
            "color": "#EAB308", # Yellow
            "urgency": "Low",
            "action": "Good working competency; reinforce with capstone projects"
        }
    else:
        return {
            "level": "advanced",
            "label": "Advanced",
            "color": "#10B981", # Green
            "urgency": "None",
            "action": "Mastery achieved; eligible for mentor status or advanced cert"
        }

def compute_weighted_score(
    quiz_score: float,
    assessment_score: float,
    course_completion: float,
    self_score: float,
    activity_score: float,
    weights: Optional[Dict[str, float]] = None
) -> float:
    w = weights or DEFAULT_WEIGHTS
    raw_score = (
        (quiz_score * w.get("quiz", 0.30)) +
        (assessment_score * w.get("assessment", 0.20)) +
        (course_completion * w.get("course", 0.20)) +
        (self_score * w.get("self", 0.15)) +
        (activity_score * w.get("activity", 0.15))
    )
    return round(min(max(raw_score, 0.0), 100.0), 1)

def recalculate_user_competencies(user_id: str) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get all user skills
        cursor.execute("""
            SELECT us.*, s.name as skill_name, s.category as skill_category
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = ?
        """, (user_id,))
        user_skills = [dict(r) for r in cursor.fetchall()]
        
        results = []
        for us in user_skills:
            skill_id = us["skill_id"]
            
            # Fetch latest quiz average for this skill
            cursor.execute("""
                SELECT AVG(qa.percentage) as avg_quiz, COUNT(qa.id) as count_quiz
                FROM quiz_attempts qa
                JOIN quizzes q ON qa.quiz_id = q.id
                WHERE qa.user_id = ? AND (q.skill_id = ? OR q.title LIKE ?)
            """, (user_id, skill_id, f"%{us['skill_name']}%"))
            q_row = cursor.fetchone()
            avg_quiz = float(q_row["avg_quiz"]) if q_row and q_row["avg_quiz"] is not None else float(us.get("quiz_score", 0.0))
            
            # Course completion related to skill
            cursor.execute("""
                SELECT AVG(e.progress_percentage) as avg_prog
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                WHERE e.user_id = ? AND (c.category LIKE ? OR c.title LIKE ?)
            """, (user_id, f"%{us['skill_name']}%", f"%{us['skill_name']}%"))
            c_row = cursor.fetchone()
            course_prog = float(c_row["avg_prog"]) if c_row and c_row["avg_prog"] is not None else float(us.get("course_completion", 0.0))
            
            self_score = self_rating_to_score(us.get("self_rating", "beginner"))
            assessment_score = float(us.get("assessment_score", 0.0))
            activity_score = float(us.get("learning_activity", 50.0))
            
            new_score = compute_weighted_score(
                quiz_score=avg_quiz,
                assessment_score=assessment_score,
                course_completion=course_prog,
                self_score=self_score,
                activity_score=activity_score
            )
            
            gap_info = classify_gap(new_score)
            gap_level = gap_info["level"]
            
            # Update user_skills
            cursor.execute("""
                UPDATE user_skills
                SET quiz_score = ?,
                    course_completion = ?,
                    competency_score = ?,
                    gap_level = ?,
                    last_evaluated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (avg_quiz, course_prog, new_score, gap_level, us["id"]))
            
            # Insert historical score snapshot
            cursor.execute("""
                INSERT INTO competency_scores (id, user_id, skill_id, score, recorded_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (str(uuid.uuid4()), user_id, skill_id, new_score))
            
            results.append({
                "skill_id": skill_id,
                "skill_name": us["skill_name"],
                "category": us["skill_category"],
                "score": new_score,
                "gap_level": gap_level,
                "gap_label": gap_info["label"],
                "color": gap_info["color"],
                "urgency": gap_info["urgency"],
                "action": gap_info["action"]
            })
            
        return results

def get_learner_competency_overview(user_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT us.*, s.name as skill_name, s.category as skill_category
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = ?
            ORDER BY us.competency_score ASC
        """, (user_id,))
        skills = [dict(r) for r in cursor.fetchall()]
        
        if not skills:
            return {
                "overall_learning_score": 0.0,
                "skills": [],
                "critical_gaps": [],
                "developing_gaps": [],
                "proficient_skills": [],
                "advanced_skills": []
            }
            
        enriched_skills = []
        critical_gaps = []
        developing_gaps = []
        proficient_skills = []
        advanced_skills = []
        
        total_score = 0.0
        for s in skills:
            score = float(s["competency_score"])
            total_score += score
            gap_info = classify_gap(score)
            item = {
                "id": s["id"],
                "skill_id": s["skill_id"],
                "skill_name": s["skill_name"],
                "category": s["skill_category"],
                "score": score,
                "quiz_score": float(s["quiz_score"]),
                "assessment_score": float(s["assessment_score"]),
                "course_completion": float(s["course_completion"]),
                "self_rating": s["self_rating"],
                "learning_activity": float(s["learning_activity"]),
                "gap_level": gap_info["level"],
                "gap_label": gap_info["label"],
                "color": gap_info["color"],
                "urgency": gap_info["urgency"],
                "action": gap_info["action"]
            }
            enriched_skills.append(item)
            if score < 40:
                critical_gaps.append(item)
            elif score < 60:
                developing_gaps.append(item)
            elif score < 80:
                proficient_skills.append(item)
            else:
                advanced_skills.append(item)
                
        overall_score = round(total_score / len(skills), 1) if skills else 0.0
        
        return {
            "overall_learning_score": overall_score,
            "total_skills_tracked": len(skills),
            "critical_gap_count": len(critical_gaps),
            "developing_gap_count": len(developing_gaps),
            "skills": enriched_skills,
            "critical_gaps": critical_gaps,
            "developing_gaps": developing_gaps,
            "proficient_skills": proficient_skills,
            "advanced_skills": advanced_skills
        }
