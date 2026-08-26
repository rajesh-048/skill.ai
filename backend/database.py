import sqlite3
import json
from contextlib import contextmanager
from typing import Generator
from backend.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn

@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')),
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        
        # 2. Profiles
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            avatar_url TEXT,
            education_level TEXT,
            branch TEXT,
            semester INTEGER,
            career_goal TEXT,
            preferred_learning_style TEXT,
            daily_learning_time_min INTEGER DEFAULT 60,
            bio TEXT,
            organization TEXT DEFAULT 'MoSPI University / Institute of Statistics',
            xp_points INTEGER DEFAULT 150,
            streak_days INTEGER DEFAULT 7,
            last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 3. Skills
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS skills (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # 4. User Skills & Competencies
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_skills (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            skill_id TEXT NOT NULL,
            self_rating TEXT DEFAULT 'beginner',
            quiz_score REAL DEFAULT 0.0,
            assessment_score REAL DEFAULT 0.0,
            course_completion REAL DEFAULT 0.0,
            learning_activity REAL DEFAULT 0.0,
            competency_score REAL DEFAULT 0.0,
            gap_level TEXT DEFAULT 'critical',
            last_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
            UNIQUE(user_id, skill_id)
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);")
        
        # 5. Courses
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            instructor_id TEXT NOT NULL,
            category TEXT NOT NULL,
            level TEXT NOT NULL CHECK(level IN ('Beginner', 'Intermediate', 'Advanced')),
            duration_hours REAL NOT NULL DEFAULT 10.0,
            thumbnail_url TEXT,
            rating REAL DEFAULT 4.8,
            enrolled_count INTEGER DEFAULT 0,
            is_published INTEGER DEFAULT 1,
            igot_mapped INTEGER DEFAULT 1,
            igot_competency_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 6. Course Modules
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS course_modules (
            id TEXT PRIMARY KEY,
            course_id TEXT NOT NULL,
            title TEXT NOT NULL,
            order_num INTEGER NOT NULL,
            description TEXT,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        );
        """)
        
        # 7. Lessons
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id TEXT PRIMARY KEY,
            module_id TEXT NOT NULL,
            title TEXT NOT NULL,
            order_num INTEGER NOT NULL,
            content TEXT,
            video_url TEXT,
            duration_minutes INTEGER DEFAULT 15,
            is_free_preview INTEGER DEFAULT 0,
            FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
        );
        """)
        
        # 8. Enrollments
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS enrollments (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            progress_percentage REAL DEFAULT 0.0,
            status TEXT DEFAULT 'in_progress',
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE(user_id, course_id)
        );
        """)
        
        # 9. Documents
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_path TEXT NOT NULL,
            page_count INTEGER DEFAULT 1,
            summary TEXT,
            extracted_topics TEXT, -- JSON list
            processing_status TEXT DEFAULT 'processed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 10. Document Chunks
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            topic TEXT,
            page_number INTEGER DEFAULT 1,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
        );
        """)
        
        # 11. Quizzes
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            course_id TEXT,
            document_id TEXT,
            creator_id TEXT NOT NULL,
            skill_id TEXT,
            difficulty TEXT DEFAULT 'Medium',
            total_questions INTEGER DEFAULT 5,
            passing_percentage REAL DEFAULT 60.0,
            time_limit_minutes INTEGER DEFAULT 10,
            is_adaptive INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
            FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 12. Questions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            quiz_id TEXT NOT NULL,
            question_text TEXT NOT NULL,
            question_type TEXT DEFAULT 'mcq',
            options_json TEXT NOT NULL, -- JSON array of strings
            correct_answer TEXT NOT NULL,
            explanation TEXT NOT NULL,
            topic TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Medium',
            points INTEGER DEFAULT 1,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );
        """)
        
        # 13. Quiz Attempts
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            quiz_id TEXT NOT NULL,
            score REAL NOT NULL,
            percentage REAL NOT NULL,
            total_questions INTEGER NOT NULL,
            correct_count INTEGER NOT NULL,
            wrong_count INTEGER NOT NULL,
            time_spent_seconds INTEGER DEFAULT 0,
            adaptive_level TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'completed',
            weak_topics_json TEXT,
            strong_topics_json TEXT,
            recommendations_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
        );
        """)
        
        # 14. Quiz Answers
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_answers (
            id TEXT PRIMARY KEY,
            attempt_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            user_answer TEXT NOT NULL,
            is_correct INTEGER NOT NULL,
            points_awarded INTEGER DEFAULT 0,
            FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
            FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
        );
        """)
        
        # 15. Competency History Scores
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS competency_scores (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            skill_id TEXT NOT NULL,
            score REAL NOT NULL,
            quiz_weight REAL DEFAULT 0.30,
            assessment_weight REAL DEFAULT 0.20,
            course_weight REAL DEFAULT 0.20,
            self_weight REAL DEFAULT 0.15,
            activity_weight REAL DEFAULT 0.15,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
        );
        """)
        
        # 16. Learning Paths
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_paths (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            target_goal TEXT NOT NULL,
            duration_days INTEGER DEFAULT 30,
            current_day INTEGER DEFAULT 1,
            milestones_json TEXT NOT NULL, -- JSON detailed array of 30 days
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 17. Recommendations
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            item_type TEXT NOT NULL, -- course, quiz, practice, path
            item_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            score REAL NOT NULL,
            priority_rank INTEGER DEFAULT 1,
            why_explanation TEXT NOT NULL,
            is_completed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 18. Achievements & Badges
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            badge_code TEXT NOT NULL,
            badge_name TEXT NOT NULL,
            badge_description TEXT NOT NULL,
            icon TEXT NOT NULL,
            points_xp INTEGER DEFAULT 50,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, badge_code)
        );
        """)
        
        # 19. Notifications
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            notification_type TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            link_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 20. AI Interactions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_interactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            context_sources_json TEXT,
            tokens_used INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
        
        # 21. Audit Logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            details_json TEXT,
            ip_address TEXT DEFAULT '127.0.0.1',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # 22. iGOT Integrations & Sync Logs
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS igot_sync_logs (
            id TEXT PRIMARY KEY,
            sync_type TEXT NOT NULL,
            status TEXT NOT NULL,
            records_synced INTEGER DEFAULT 0,
            details_json TEXT,
            synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        conn.commit()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
