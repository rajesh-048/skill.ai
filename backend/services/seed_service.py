import uuid
import json
from datetime import datetime, timedelta
from backend.database import get_db, init_db
from backend.services.auth_service import hash_password
from backend.services.competency_service import classify_gap, compute_weighted_score

def seed_database(force: bool = False):
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check if users exist
        cursor.execute("SELECT COUNT(*) as count FROM users")
        if cursor.fetchone()["count"] > 0 and not force:
            return
            
        print("Seeding SkillSphere AI database with realistic hackathon demo data...")
        
        # Clear tables if forced
        if force:
            for table in [
                "audit_logs", "ai_interactions", "notifications", "achievements", 
                "recommendations", "learning_paths", "competency_scores", "quiz_answers", 
                "quiz_attempts", "questions", "quizzes", "document_chunks", "documents", 
                "enrollments", "lessons", "course_modules", "courses", "user_skills", 
                "skills", "profiles", "users", "igot_sync_logs"
            ]:
                cursor.execute(f"DELETE FROM {table}")
                
        # 1. Create Core Users
        password_hash = hash_password("Demo@123")
        
        users_data = [
            # Student Demo Persona
            ("student_ravi_01", "demo.student@skillsphere.ai", password_hash, "student", "Ravi Kumar", "B.Tech", "Computer Science & Engineering", 4, "AI/ML Engineer", 7, 350),
            ("student_priya_02", "priya.sharma@skillsphere.ai", password_hash, "student", "Priya Sharma", "B.Tech", "Data Science", 6, "Data Scientist", 12, 520),
            ("student_amit_03", "amit.verma@skillsphere.ai", password_hash, "student", "Amit Verma", "MCA", "Computer Applications", 2, "Backend Developer", 4, 210),
            ("student_sneha_04", "sneha.patel@skillsphere.ai", password_hash, "student", "Sneha Patel", "B.Tech", "Information Technology", 4, "Full Stack Developer", 9, 440),
            ("student_rahul_05", "rahul.nair@skillsphere.ai", password_hash, "student", "Rahul Nair", "M.Sc", "Applied Statistics", 2, "MoSPI Statistical Analyst", 15, 680),
            ("student_divya_06", "divya.sen@skillsphere.ai", password_hash, "student", "Divya Sen", "B.Tech", "CSE", 8, "AI Researcher", 20, 890),
            ("student_karan_07", "karan.j@skillsphere.ai", password_hash, "student", "Karan Joshi", "B.Sc", "Mathematics & Computing", 4, "Machine Learning Engineer", 6, 290),
            ("student_anita_08", "anita.desai@skillsphere.ai", password_hash, "student", "Anita Desai", "B.Tech", "CSE", 6, "Cloud Architect", 8, 410),
            ("student_vikram_09", "vikram.singh@skillsphere.ai", password_hash, "student", "Vikram Singh", "B.Tech", "ECE", 4, "Embedded AI Engineer", 3, 180),
            ("student_pooja_10", "pooja.rao@skillsphere.ai", password_hash, "student", "Pooja Rao", "B.Tech", "CSE", 6, "Cybersecurity Analyst", 11, 560),
            
            # Instructor Demo Persona & Faculty
            ("instructor_sunita_01", "demo.instructor@skillsphere.ai", password_hash, "instructor", "Dr. Sunita Sharma", "Ph.D.", "Computer Science", 0, "Professor & AI Lead", 35, 1200),
            ("instructor_arvind_02", "arvind.menon@skillsphere.ai", password_hash, "instructor", "Prof. Arvind Menon", "M.Tech", "Algorithms", 0, "Associate Professor", 28, 980),
            ("instructor_rajesh_03", "rajesh.gupta@skillsphere.ai", password_hash, "instructor", "Dr. Rajesh Gupta", "Ph.D.", "Data Engineering", 0, "Senior Data Specialist", 40, 1500),
            ("instructor_ananya_04", "ananya.iyer@skillsphere.ai", password_hash, "instructor", "Prof. Ananya Iyer", "M.S.", "Cybersecurity", 0, "Security Architect", 22, 850),
            ("instructor_vikas_05", "vikas.patel@skillsphere.ai", password_hash, "instructor", "Dr. Vikas Patel", "Ph.D.", "Statistics & Policy", 0, "MoSPI Visiting Advisor", 50, 1800),
            
            # Admin Demo Persona
            ("admin_01", "demo.admin@skillsphere.ai", password_hash, "admin", "MoSPI Platform Admin", "Directorate", "Governance & Analytics", 0, "Capacity Building Director", 45, 2000),
        ]
        
        for u_id, email, p_hash, role, name, edu, branch, sem, goal, streak, xp in users_data:
            cursor.execute("""
                INSERT INTO users (id, email, hashed_password, role)
                VALUES (?, ?, ?, ?)
            """, (u_id, email, p_hash, role))
            
            cursor.execute("""
                INSERT INTO profiles (
                    id, user_id, full_name, education_level, branch, semester, career_goal,
                    streak_days, xp_points, preferred_learning_style, daily_learning_time_min
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Hands-on Projects & AI Quizzes', 60)
            """, (str(uuid.uuid4()), u_id, name, edu, branch, sem, goal, streak, xp))
            
        # 2. Seed Skills (20+ skills)
        skills_data = [
            ("skill_py", "Python Programming", "Programming Languages", "Syntax, OOP, standard libraries, scripting, and data handling."),
            ("skill_dsa", "Data Structures & Algorithms", "Computer Science Core", "Trees, graphs, dynamic programming, searching and sorting."),
            ("skill_java", "Java Programming", "Programming Languages", "Object-oriented design, JVM internals, multithreading, and collections."),
            ("skill_sql", "Database Management Systems", "Data & Storage", "Relational databases, SQL queries, indexing, normalization, and ACID properties."),
            ("skill_ml", "Machine Learning", "Artificial Intelligence", "Supervised/unsupervised algorithms, gradient descent, loss functions, and evaluation."),
            ("skill_web", "Web Development", "Software Engineering", "Full stack architectures, React, RESTful APIs, and frontend styling."),
            ("skill_ai", "Artificial Intelligence", "Artificial Intelligence", "Heuristics, search trees, knowledge representation, and neural networks."),
            ("skill_cyber", "Cybersecurity Fundamentals", "Security & Governance", "Network security, cryptography, vulnerability assessment, and compliance."),
            ("skill_stat", "Statistical Sampling & Analysis", "MoSPI Analytics", "Probability distributions, hypothesis testing, survey methodology, and estimation."),
            ("skill_cloud", "Cloud Computing & DevOps", "Infrastructure", "Containers, microservices, CI/CD pipelines, and cloud hosting."),
            ("skill_git", "Version Control & Git", "Development Tools", "Branching workflows, merges, conflict resolution, and collaborative repositories."),
            ("skill_react", "React.js Framework", "Frontend", "Component lifecycle, hooks, state management, and virtual DOM optimization."),
            ("skill_rest", "REST API Design & FastAPI", "Backend", "HTTP methods, payload validation, authentication, and endpoint security."),
            ("skill_nlp", "Natural Language Processing", "Artificial Intelligence", "Tokenization, embeddings, transformer architectures, and LLM prompting."),
            ("skill_statsgov", "MoSPI Data Governance", "MoSPI Analytics", "National data standards, open data initiatives, and statistical quality audits.")
        ]
        
        for s_id, s_name, s_cat, s_desc in skills_data:
            cursor.execute("""
                INSERT INTO skills (id, name, category, description)
                VALUES (?, ?, ?, ?)
            """, (s_id, s_name, s_cat, s_desc))
            
        # 3. Seed Ravi Kumar's Benchmark User Skills (Exactly matching SIH Prompt Requirements)
        # Python: 82% (Proficient/Mastery), Java: 65% (Proficient), SQL: 70% (Proficient), DSA: 48% (Developing/Orange), ML: 35% (Critical/Red)
        ravi_skills = [
            ("skill_py", "advanced", 85.0, 80.0, 90.0, 80.0, 82.0, "proficient"),
            ("skill_java", "intermediate", 65.0, 60.0, 70.0, 65.0, 65.0, "proficient"),
            ("skill_sql", "intermediate", 72.0, 70.0, 75.0, 60.0, 70.0, "proficient"),
            ("skill_dsa", "beginner", 45.0, 50.0, 55.0, 45.0, 48.0, "developing"),
            ("skill_ml", "beginner", 30.0, 35.0, 40.0, 35.0, 35.0, "critical"),
            ("skill_web", "intermediate", 60.0, 65.0, 60.0, 55.0, 60.0, "proficient"),
            ("skill_ai", "beginner", 35.0, 30.0, 40.0, 30.0, 34.0, "critical")
        ]
        
        for s_id, s_rating, q_sc, a_sc, c_sc, l_act, comp_sc, gap_lvl in ravi_skills:
            cursor.execute("""
                INSERT INTO user_skills (
                    id, user_id, skill_id, self_rating, quiz_score, assessment_score,
                    course_completion, learning_activity, competency_score, gap_level
                ) VALUES (?, 'student_ravi_01', ?, ?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), s_id, s_rating, q_sc, a_sc, c_sc, l_act, comp_sc, gap_lvl))
            
        # Seed skills for remaining students (varied distribution for class heatmap)
        other_students = ["student_priya_02", "student_amit_03", "student_sneha_04", "student_rahul_05", 
                          "student_divya_06", "student_karan_07", "student_anita_08", "student_vikram_09", "student_pooja_10"]
        
        sample_distributions = [
            (88, 75, 80, 70, 76), # Priya (High)
            (60, 55, 68, 42, 38), # Amit (Medium-Low)
            (75, 82, 70, 64, 52), # Sneha (Medium-High)
            (82, 60, 92, 50, 70), # Rahul (MoSPI stats focus)
            (95, 90, 88, 85, 92), # Divya (Mastery)
            (70, 45, 65, 40, 34), # Karan (At-risk ML)
            (80, 70, 75, 60, 55), # Anita (Steady)
            (50, 40, 55, 38, 30), # Vikram (At-risk multiple)
            (78, 65, 80, 58, 62), # Pooja (Proficient)
        ]
        
        core_skill_ids = ["skill_py", "skill_java", "skill_sql", "skill_dsa", "skill_ml"]
        for st_id, dist in zip(other_students, sample_distributions):
            for sk_id, sc in zip(core_skill_ids, dist):
                gap_info = classify_gap(sc)
                cursor.execute("""
                    INSERT INTO user_skills (
                        id, user_id, skill_id, self_rating, quiz_score, assessment_score,
                        course_completion, learning_activity, competency_score, gap_level
                    ) VALUES (?, ?, ?, 'intermediate', ?, ?, ?, ?, ?, ?)
                """, (str(uuid.uuid4()), st_id, sk_id, sc, sc - 2, sc + 4, 50.0, sc, gap_info["level"]))
                
        # 4. Seed 8 Realistic Courses
        courses_data = [
            ("course_ml_101", "Machine Learning Fundamentals", "machine-learning-fundamentals", 
             "Comprehensive mastery course covering supervised learning, gradient descent, loss functions, decision trees, and model evaluation metrics for real-world deployments.",
             "instructor_sunita_01", "Machine Learning", "Beginner", 14.5, "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&auto=format&fit=crop&q=60", 4.9, 142, "IGOT-AI-105"),
             
            ("course_dsa_201", "Data Structures & Algorithms Intensive", "data-structures-algorithms-intensive",
             "In-depth analysis of trees, graph traversals (BFS/DFS), dynamic programming, binary search trees, and asymptotic complexity optimization.",
             "instructor_arvind_02", "Computer Science Core", "Intermediate", 18.0, "https://images.unsplash.com/photo-1516116211227-bbc155b9910d?w=600&auto=format&fit=crop&q=60", 4.8, 185, "IGOT-DATA-204"),
             
            ("course_py_101", "Python Programming Fundamentals", "python-programming-fundamentals",
             "Modern Python from ground up: data structures, object-oriented design, generators, decorators, exception handling, and standard libraries.",
             "instructor_sunita_01", "Programming Languages", "Beginner", 10.0, "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60", 4.9, 310, "IGOT-AI-105"),
             
            ("course_db_201", "Database Management Systems & SQL", "database-management-systems-sql",
             "Relational schemas, complex joins, subqueries, B-tree indexing, normal forms (1NF to BCNF), and transaction concurrency protocols.",
             "instructor_rajesh_03", "Data & Storage", "Intermediate", 12.0, "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60", 4.7, 198, "IGOT-STAT-401"),
             
            ("course_java_101", "Java Programming & OOP Architecture", "java-programming-oop-architecture",
             "Object-oriented programming in Java, Collections framework, streams, multithreading synchronization, and robust enterprise patterns.",
             "instructor_arvind_02", "Programming Languages", "Intermediate", 16.0, "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60", 4.8, 160, "IGOT-DATA-204"),
             
            ("course_web_201", "Modern Full Stack Web Development", "modern-full-stack-web-development",
             "Building scalable full-stack web applications with modern React, Tailwind CSS, FastAPI backend services, and REST API integration.",
             "instructor_ananya_04", "Software Engineering", "Intermediate", 15.0, "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60", 4.8, 220, "IGOT-GOV-302"),
             
            ("course_stat_301", "National Statistics & Census Analytics", "national-statistics-census-analytics",
             "Official statistical methods, MoSPI sampling designs, survey data verification, population index computations, and policy reporting.",
             "instructor_vikas_05", "MoSPI Analytics", "Advanced", 12.5, "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60", 4.9, 115, "IGOT-STAT-401"),
             
            ("course_sec_101", "Cybersecurity Fundamentals & Threat Defense", "cybersecurity-fundamentals-threat-defense",
             "Principles of confidentiality, integrity, availability (CIA), public key cryptography, OWASP top 10 vulnerabilities, and security auditing.",
             "instructor_ananya_04", "Security & Governance", "Beginner", 11.0, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=60", 4.7, 140, "IGOT-GOV-302")
        ]
        
        for c_id, c_title, c_slug, c_desc, inst_id, c_cat, c_lvl, c_hrs, c_thumb, c_rat, c_enr, igot_code in courses_data:
            cursor.execute("""
                INSERT INTO courses (
                    id, title, slug, description, instructor_id, category, level,
                    duration_hours, thumbnail_url, rating, enrolled_count, is_published, igot_competency_code
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            """, (c_id, c_title, c_slug, c_desc, inst_id, c_cat, c_lvl, c_hrs, c_thumb, c_rat, c_enr, igot_code))
            
            # Add 3 Modules per course
            mod_titles = [
                ("Module 1: Foundational Principles & Core Concepts", "Understanding the basic architecture, key terminology, and environments."),
                ("Module 2: Practical Implementations & Algorithmic Procedures", "Hands-on labs, problem solving, and practical coding patterns."),
                ("Module 3: Advanced Optimization & Capstone Evaluation", "Real-world scaling, benchmarking, and comprehensive assessments.")
            ]
            for m_idx, (m_title, m_desc) in enumerate(mod_titles, start=1):
                mod_id = f"{c_id}_m{m_idx}"
                cursor.execute("""
                    INSERT INTO course_modules (id, course_id, title, order_num, description)
                    VALUES (?, ?, ?, ?, ?)
                """, (mod_id, c_id, m_title, m_idx, m_desc))
                
                # Add 2 Lessons per module
                for l_idx in [1, 2]:
                    less_id = f"{mod_id}_l{l_idx}"
                    less_title = f"Lesson {m_idx}.{l_idx}: Applied Concepts & Case Studies"
                    cursor.execute("""
                        INSERT INTO lessons (id, module_id, title, order_num, content, duration_minutes, is_free_preview)
                        VALUES (?, ?, ?, ?, 'Comprehensive structured lesson content with examples and interactive knowledge checks.', 20, ?)
                    """, (less_id, mod_id, less_title, l_idx, 1 if l_idx == 1 else 0))
                    
        # 5. Seed Enrollments for Ravi Kumar
        cursor.execute("""
            INSERT INTO enrollments (id, user_id, course_id, progress_percentage, status)
            VALUES (?, 'student_ravi_01', 'course_py_101', 90.0, 'completed')
        """, (str(uuid.uuid4()),))
        cursor.execute("""
            INSERT INTO enrollments (id, user_id, course_id, progress_percentage, status)
            VALUES (?, 'student_ravi_01', 'course_dsa_201', 55.0, 'in_progress')
        """, (str(uuid.uuid4()),))
        cursor.execute("""
            INSERT INTO enrollments (id, user_id, course_id, progress_percentage, status)
            VALUES (?, 'student_ravi_01', 'course_db_201', 75.0, 'in_progress')
        """, (str(uuid.uuid4()),))
        cursor.execute("""
            INSERT INTO enrollments (id, user_id, course_id, progress_percentage, status)
            VALUES (?, 'student_ravi_01', 'course_ml_101', 20.0, 'in_progress')
        """, (str(uuid.uuid4()),))
        
        # 6. Seed Sample Documents
        sample_doc_id = "doc_ml_sample_01"
        sample_ml_text = """# Machine Learning Basics & Fundamentals
## 1. Introduction to Machine Learning
Machine learning is a field of artificial intelligence focused on building applications that learn from data and improve their accuracy over time without being explicitly programmed.

## 2. Supervised vs Unsupervised Learning
Supervised learning utilizes labeled datasets to train algorithms to classify data or predict outcomes accurately. Key algorithms include Linear Regression, Logistic Regression, Support Vector Machines (SVM), and Random Forests.
Unsupervised learning analyzes and clusters unlabeled datasets to discover hidden patterns or data groupings without human intervention, using algorithms like K-Means and Principal Component Analysis (PCA).

## 3. The Gradient Descent Algorithm
Gradient descent is a first-order optimization algorithm used to minimize the cost or loss function in machine learning models. The parameter updates occur iteratively:
theta = theta - alpha * gradient(J(theta))
where alpha is the learning rate. Choosing an optimal learning rate is critical to prevent oscillation or slow convergence.

## 4. Overfitting, Bias-Variance Tradeoff, and Regularization
Overfitting happens when a model learns the training data too well, capturing noise rather than generalized patterns. High variance leads to overfitting, whereas high bias leads to underfitting.
L1 Regularization (Lasso) adds the absolute value of coefficients as a penalty term to the loss function, producing sparse models.
L2 Regularization (Ridge) adds the squared magnitude of coefficients to shrink weights smoothly.

## 5. Model Evaluation Metrics
For classification: Precision, Recall, F1-Score, and ROC-AUC curve are superior to simple accuracy when dealing with imbalanced datasets."""

        cursor.execute("""
            INSERT INTO documents (
                id, user_id, title, original_filename, file_type, file_size, file_path,
                page_count, summary, extracted_topics, processing_status
            ) VALUES (?, 'student_ravi_01', 'Machine Learning Basics & Notes', 'Machine_Learning_Basics.pdf', '.pdf', 245800, 'uploads/Machine_Learning_Basics.pdf', 3, 'Comprehensive guide covering supervised vs unsupervised learning, gradient descent optimization, regularization, and model evaluation metrics.', ?, 'processed')
        """, (sample_doc_id, json.dumps(["Supervised vs Unsupervised Learning", "Gradient Descent Optimization", "Overfitting & Regularization", "Evaluation Metrics"])))
        
        # Add chunks for sample document
        chunks_sample = [
            ("Supervised vs Unsupervised Learning", "Supervised learning utilizes labeled datasets to train algorithms to classify data or predict outcomes accurately. Common algorithms include Linear Regression, Logistic Regression, and Support Vector Machines. Unsupervised learning discovers hidden patterns in unlabeled datasets.", 1),
            ("Gradient Descent Optimization", "Gradient descent is a first-order optimization algorithm used to minimize the cost or loss function in machine learning models. Parameter updates occur iteratively with learning rate alpha.", 2),
            ("Overfitting & Regularization", "High variance causes overfitting, while high bias causes underfitting. L1 Regularization (Lasso) introduces sparsity, whereas L2 Regularization (Ridge) shrinks parameter weights smoothly.", 3)
        ]
        for c_idx, (c_top, c_body, p_num) in enumerate(chunks_sample):
            cursor.execute("""
                INSERT INTO document_chunks (id, document_id, chunk_index, content, topic, page_number)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), sample_doc_id, c_idx, c_body, c_top, p_num))
            
        # 7. Seed Achievements / Badges
        badges_data = [
            ("student_ravi_01", "streak_7", "🔥 7-Day Streak Master", "Maintained an active daily learning streak for 7 consecutive days", "🔥", 150),
            ("student_ravi_01", "first_quiz", "🏆 First Assessment", "Completed your initial AI-generated diagnostic quiz", "🏆", 50),
            ("student_ravi_01", "py_master", "🧠 Python Pioneer", "Demonstrated advanced proficiency (82%) in Python fundamentals", "🧠", 100),
            ("student_ravi_01", "doc_explorer", "📚 Document Explorer", "Uploaded and synthesized custom academic notes with AI", "📚", 75)
        ]
        for u_id, b_code, b_name, b_desc, b_icon, b_xp in badges_data:
            cursor.execute("""
                INSERT INTO achievements (id, user_id, badge_code, badge_name, badge_description, icon, points_xp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), u_id, b_code, b_name, b_desc, b_icon, b_xp))
            
        # 8. Seed Notifications
        notifications_data = [
            ("student_ravi_01", "Critical Gap Detected", "AI detected a 35% competency in Machine Learning. Recommended course: 'Machine Learning Fundamentals'.", "course", "/courses/machine-learning-fundamentals"),
            ("student_ravi_01", "7-Day Streak Milestone", "Congratulations! You earned 150 XP for completing your 7-day learning streak.", "streak", "/dashboard"),
            ("student_ravi_01", "New Adaptive Quiz Ready", "Test your knowledge on Binary Search Trees to strengthen your Data Structures score.", "quiz", "/quizzes"),
            ("student_ravi_01", "MoSPI Competency Framework Update", "Your profile is synchronized with iGOT Karmayogi standard IGOT-AI-105.", "announcement", "/igot")
        ]
        for u_id, n_title, n_msg, n_type, n_link in notifications_data:
            cursor.execute("""
                INSERT INTO notifications (id, user_id, title, message, notification_type, is_read, link_url)
                VALUES (?, ?, ?, ?, ?, 0, ?)
            """, (str(uuid.uuid4()), u_id, n_title, n_msg, n_type, n_link))
            
        # 9. Seed Audit Logs
        audit_records = [
            ("student_ravi_01", "USER_LOGIN", "auth", "student_ravi_01", json.dumps({"ip": "127.0.0.1", "device": "Desktop Chrome"})),
            ("student_ravi_01", "COMPETENCY_EVALUATION", "competency", "student_ravi_01", json.dumps({"ml_score": 35.0, "dsa_score": 48.0, "status": "gaps_flagged"})),
            ("instructor_sunita_01", "COURSE_PUBLISHED", "course", "course_ml_101", json.dumps({"title": "Machine Learning Fundamentals"})),
            ("admin_01", "IGOT_FRAMEWORK_SYNC", "integration", "igot_hub", json.dumps({"records_synced": 12, "status": "SUCCESS"}))
        ]
        for u_id, action, e_type, e_id, details in audit_records:
            cursor.execute("""
                INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details_json)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (str(uuid.uuid4()), u_id, action, e_type, e_id, details))
            
        conn.commit()
        print("Database successfully populated with comprehensive SIH demo dataset.")

if __name__ == "__main__":
    seed_database(force=True)
