import json
import uuid
from typing import List, Dict, Any
from backend.database import get_db
from backend.services.competency_service import get_learner_competency_overview

def calculate_rec_score(
    skill_gap: float, # 100 - competency
    career_relevance: float, # 0 - 100
    learning_history: float, # 0 - 100
    difficulty_fit: float, # 0 - 100
    user_interest: float # 0 - 100
) -> float:
    score = (
        (skill_gap * 0.40) +
        (career_relevance * 0.25) +
        (learning_history * 0.15) +
        (difficulty_fit * 0.10) +
        (user_interest * 0.10)
    )
    return round(score, 1)

def generate_recommendations(user_id: str) -> List[Dict[str, Any]]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get user profile
        cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
        profile_row = cursor.fetchone()
        profile = dict(profile_row) if profile_row else {}
        career_goal = profile.get("career_goal", "AI/ML Engineer").lower()
        
        # Get competency overview
        comp_data = get_learner_competency_overview(user_id)
        skills = comp_data.get("skills", [])
        
        # Get available courses
        cursor.execute("SELECT * FROM courses WHERE is_published = 1")
        courses = [dict(r) for r in cursor.fetchall()]
        
        # Get user enrollments
        cursor.execute("SELECT course_id, progress_percentage, status FROM enrollments WHERE user_id = ?", (user_id,))
        enrolled_map = {r["course_id"]: dict(r) for r in cursor.fetchall()}
        
        recommendations = []
        
        for course in courses:
            c_id = course["id"]
            c_title = course["title"]
            c_cat = course["category"]
            c_level = course["level"]
            
            # Find matching skill in user profile
            matched_skill = None
            for s in skills:
                if s["skill_name"].lower() in c_title.lower() or s["skill_name"].lower() in c_cat.lower() or c_cat.lower() in s["skill_name"].lower():
                    matched_skill = s
                    break
            
            if matched_skill:
                skill_comp = matched_skill["score"]
                skill_gap = max(100.0 - skill_comp, 0.0)
                skill_name = matched_skill["skill_name"]
            else:
                skill_comp = 50.0
                skill_gap = 50.0
                skill_name = c_cat
                
            # Career relevance
            career_rel = 50.0
            if "ai" in career_goal or "ml" in career_goal or "data" in career_goal:
                if any(k in c_title.lower() for k in ["machine learning", "python", "ai", "data"]):
                    career_rel = 95.0
            elif "web" in career_goal or "full stack" in career_goal:
                if any(k in c_title.lower() for k in ["web", "javascript", "react", "database"]):
                    career_rel = 95.0
            elif "cyber" in career_goal or "security" in career_goal:
                if "security" in c_title.lower():
                    career_rel = 95.0
                    
            # Learning history
            enrollment = enrolled_map.get(c_id)
            if enrollment:
                prog = enrollment["progress_percentage"]
                if prog > 0 and prog < 100:
                    hist_score = 90.0 # Resume course
                else:
                    hist_score = 20.0
            else:
                hist_score = 65.0
                
            # Difficulty fit
            diff_fit = 80.0
            if skill_comp < 40 and c_level == "Beginner":
                diff_fit = 95.0
            elif skill_comp >= 40 and skill_comp < 70 and c_level == "Intermediate":
                diff_fit = 90.0
            elif skill_comp >= 70 and c_level == "Advanced":
                diff_fit = 95.0
            else:
                diff_fit = 60.0
                
            user_interest = 85.0
            
            rec_score = calculate_rec_score(
                skill_gap=skill_gap,
                career_relevance=career_rel,
                learning_history=hist_score,
                difficulty_fit=diff_fit,
                user_interest=user_interest
            )
            
            # Construct human-readable "Why" explanation
            why = f"Your current competency in {skill_name} is {skill_comp:.0f}%. "
            if skill_comp < 40:
                why += f"This is identified as a Critical Competency Gap. "
            elif skill_comp < 60:
                why += f"This skill is currently Developing. "
            if career_rel > 80:
                why += f"It has high alignment with your target career goal of '{profile.get('career_goal', 'Engineering')}'. "
            why += f"Completing this {c_level}-level course directly accelerates your readiness."
            
            recommendations.append({
                "item_type": "course",
                "item_id": c_id,
                "title": c_title,
                "description": course["description"],
                "score": rec_score,
                "category": c_cat,
                "level": c_level,
                "thumbnail_url": course["thumbnail_url"],
                "duration_hours": course["duration_hours"],
                "enrolled": c_id in enrolled_map,
                "progress_percentage": enrolled_map[c_id]["progress_percentage"] if c_id in enrolled_map else 0,
                "why_explanation": why
            })
            
        # Sort by rec_score descending
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        
        # Save top recommendations to DB
        cursor.execute("DELETE FROM recommendations WHERE user_id = ?", (user_id,))
        for idx, r in enumerate(recommendations[:8], start=1):
            rec_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO recommendations (id, user_id, item_type, item_id, title, description, score, priority_rank, why_explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (rec_id, user_id, r["item_type"], r["item_id"], r["title"], r["description"], r["score"], idx, r["why_explanation"]))
            r["id"] = rec_id
            r["priority_rank"] = idx
            
        return recommendations

def generate_personalized_30_day_path(user_id: str) -> Dict[str, Any]:
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
        profile_row = cursor.fetchone()
        profile = dict(profile_row) if profile_row else {}
        career_goal = profile.get("career_goal", "AI/ML Engineer")
        
        comp_data = get_learner_competency_overview(user_id)
        critical_gaps = comp_data.get("critical_gaps", [])
        developing_gaps = comp_data.get("developing_gaps", [])
        
        # Priority skills
        p1_skill = critical_gaps[0]["skill_name"] if critical_gaps else "Machine Learning"
        p2_skill = critical_gaps[1]["skill_name"] if len(critical_gaps) > 1 else (developing_gaps[0]["skill_name"] if developing_gaps else "Data Structures")
        p3_skill = developing_gaps[1]["skill_name"] if len(developing_gaps) > 1 else "Python Programming"
        
        # Generate 30 structured days
        days = []
        
        # Phase 1: Days 1-10 (Priority 1 Critical Gap)
        phase1_topics = [
            f"{p1_skill} Fundamentals & Environment Setup",
            f"Core Concepts & Syntax of {p1_skill}",
            f"Mathematical & Logical Foundations for {p1_skill}",
            f"Data Structures & Processing in {p1_skill}",
            f"Hands-on Lab 1: Building Base Pipeline",
            f"Error Handling & Debugging Techniques",
            f"Intermediate Algorithms in {p1_skill}",
            f"Hands-on Lab 2: Real-world Dataset Modeling",
            f"Review & Checkpoint Quiz: {p1_skill}",
            f"Mini Project 1: End-to-End {p1_skill} Pipeline"
        ]
        for i, t in enumerate(phase1_topics, start=1):
            days.append({
                "day": i,
                "phase": f"Phase 1: Critical Gap Remediation ({p1_skill})",
                "topic": t,
                "focus_skill": p1_skill,
                "estimated_minutes": profile.get("daily_learning_time_min", 60),
                "task_type": "Quiz" if "Quiz" in t else ("Project" if "Project" in t else "Module"),
                "status": "completed" if i <= 3 else ("in_progress" if i == 4 else "pending")
            })
            
        # Phase 2: Days 11-20 (Priority 2 Secondary Gap)
        phase2_topics = [
            f"Bridge Concepts: Integrating {p1_skill} with {p2_skill}",
            f"{p2_skill} Core Principles & Optimization",
            f"Algorithm Design & Complexity Analysis in {p2_skill}",
            f"Data Transformation & Tree/Graph Traversal",
            f"Problem Solving Intensive: Top 5 Patterns",
            f"Hands-on Lab 3: Performance Profiling",
            f"System Design Basics & Integration",
            f"Practice Assessment & Speed Run",
            f"Review & Checkpoint Quiz: {p2_skill}",
            f"Mini Project 2: Integrated System"
        ]
        for i, t in enumerate(phase2_topics, start=11):
            days.append({
                "day": i,
                "phase": f"Phase 2: Secondary Gap Reinforcement ({p2_skill})",
                "topic": t,
                "focus_skill": p2_skill,
                "estimated_minutes": profile.get("daily_learning_time_min", 60),
                "task_type": "Quiz" if "Quiz" in t else ("Project" if "Project" in t else "Module"),
                "status": "pending"
            })
            
        # Phase 3: Days 21-30 (Mastery, Synthesis & Capstone)
        phase3_topics = [
            f"Advanced Applications in {p3_skill}",
            "Production Architecture & Best Practices",
            "Security, Scalability & Performance Tuning",
            "MoSPI / Enterprise Case Study Analysis",
            "iGOT Karmayogi Competency Alignment Practice",
            "Capstone Project: Ideation & Architecture",
            "Capstone Project: Development & Testing",
            "Capstone Project: Deployment & Documentation",
            "Comprehensive Grand Assessment (All Domains)",
            "Mastery Certification & Gap Closure Evaluation"
        ]
        for i, t in enumerate(phase3_topics, start=21):
            days.append({
                "day": i,
                "phase": "Phase 3: Synthesis & Capstone Project",
                "topic": t,
                "focus_skill": p3_skill,
                "estimated_minutes": profile.get("daily_learning_time_min", 60),
                "task_type": "Assessment" if "Assessment" in t else ("Project" if "Project" in t else "Module"),
                "status": "pending"
            })
            
        path_title = f"30-Day Personalized Path: {career_goal} Accelerator"
        path_desc = f"Customized dynamically to close critical gaps in {p1_skill} and {p2_skill} while reinforcing {p3_skill}."
        
        # Save to DB
        cursor.execute("SELECT id FROM learning_paths WHERE user_id = ? AND is_active = 1", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            path_id = existing["id"]
            cursor.execute("""
                UPDATE learning_paths
                SET title = ?, description = ?, target_goal = ?, milestones_json = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (path_title, path_desc, career_goal, json.dumps(days), path_id))
        else:
            path_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO learning_paths (id, user_id, title, description, target_goal, duration_days, current_day, milestones_json)
                VALUES (?, ?, ?, ?, ?, 30, 4, ?)
            """, (path_id, user_id, path_title, path_desc, career_goal, json.dumps(days)))
            
        return {
            "id": path_id,
            "title": path_title,
            "description": path_desc,
            "target_goal": career_goal,
            "duration_days": 30,
            "current_day": 4,
            "completion_percentage": round((3 / 30) * 100, 1),
            "priority_1_skill": p1_skill,
            "priority_2_skill": p2_skill,
            "priority_3_skill": p3_skill,
            "milestones": days
        }
