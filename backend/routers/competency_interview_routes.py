"""
AI Competency Interview — Adaptive Q&A Assessment

Flow:
1. User selects a skill to assess (or AI picks based on gaps)
2. System generates a question at current difficulty level
3. User answers, AI evaluates
4. Difficulty adjusts up/down based on correctness
5. After N questions, computes final competency score
6. Score feeds into the competency system

This is the "Competency Interview" WOW feature from the SIH strategy.
"""
import uuid
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.services.auth_service import get_current_user
from backend.services.ai_service import ai_service
from backend.services.competency_service import recalculate_user_competencies, classify_gap
from backend.schemas import OnboardingRequest

router = APIRouter(prefix="/competency-interview", tags=["AI Competency Interview"])

# Difficulty levels and scoring
DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Expert"]
TOTAL_QUESTIONS = 6  # Number of questions per interview session

# Question banks organized by domain and difficulty
QUESTION_BANK = {
    "python": {
        "Easy": [
            {
                "question": "What is the output of `print(type([]))` in Python?",
                "options": ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"],
                "correct": 0,
                "explanation": "Empty square brackets `[]` create a list object. `type()` returns `<class 'list'>`.",
                "topic": "Python Basics"
            },
            {
                "question": "Which keyword is used to define a function in Python?",
                "options": ["function", "func", "def", "define"],
                "correct": 2,
                "explanation": "Python uses the `def` keyword to define functions, followed by the function name and parentheses.",
                "topic": "Python Syntax"
            },
            {
                "question": "What does `len('Hello')` return?",
                "options": ["4", "5", "6", "Error"],
                "correct": 1,
                "explanation": "The string 'Hello' has 5 characters, so `len()` returns 5.",
                "topic": "Python Built-ins"
            },
        ],
        "Medium": [
            {
                "question": "What is the difference between a list and a tuple in Python?",
                "options": [
                    "Lists are mutable, tuples are immutable",
                    "Tuples are mutable, lists are immutable",
                    "Both are mutable",
                    "There is no difference"
                ],
                "correct": 0,
                "explanation": "Lists use `[]` and can be modified after creation. Tuples use `()` and are immutable — once created, elements cannot be changed.",
                "topic": "Python Data Structures"
            },
            {
                "question": "What is a decorator in Python?",
                "options": [
                    "A function that modifies the behavior of another function",
                    "A type of loop",
                    "A way to create classes",
                    "A method for file I/O"
                ],
                "correct": 0,
                "explanation": "Decorators are higher-order functions that take a function as input and return a modified version, using @syntax above the function definition.",
                "topic": "Python Advanced"
            },
            {
                "question": "What does `*args` and `**kwargs` do in a function signature?",
                "options": [
                    "*args collects positional args as a tuple, **kwargs collects keyword args as a dict",
                    "They are used for type checking",
                    "They define default parameter values",
                    "They create static class variables"
                ],
                "correct": 0,
                "explanation": "`*args` packs extra positional arguments into a tuple. `**kwargs` packs extra keyword arguments into a dictionary.",
                "topic": "Python Functions"
            },
        ],
        "Hard": [
            {
                "question": "What is the GIL in CPython and why does it matter?",
                "options": [
                    "Global Interpreter Lock — prevents true multi-threaded execution of Python bytecode",
                    "General Input Layer — handles network I/O",
                    "Global Index Library — manages hash tables",
                    "Generic Import Loader — handles module imports"
                ],
                "correct": 0,
                "explanation": "The GIL ensures only one thread executes Python bytecode at a time, limiting CPU-bound parallelism in multithreaded programs. Use multiprocessing or async for concurrent workloads.",
                "topic": "Python Internals"
            },
            {
                "question": "What is the time complexity of checking `x in my_list` for a Python list?",
                "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                "correct": 2,
                "explanation": "Python lists are dynamic arrays. Checking membership requires a linear scan, so it's O(n). For O(1) lookups, use a set or dict.",
                "topic": "Python Performance"
            },
        ],
    },
    "sql": {
        "Easy": [
            {
                "question": "Which SQL command is used to retrieve data from a database?",
                "options": ["GET", "FETCH", "SELECT", "RETRIEVE"],
                "correct": 2,
                "explanation": "The SELECT statement is used to query and retrieve data from one or more tables in a relational database.",
                "topic": "SQL Basics"
            },
            {
                "question": "What does the `WHERE` clause do in SQL?",
                "options": [
                    "Filters rows based on a condition",
                    "Groups rows together",
                    "Sorts the result set",
                    "Deletes duplicate rows"
                ],
                "correct": 0,
                "explanation": "The WHERE clause filters rows that match a specified condition before any grouping or aggregation occurs.",
                "topic": "SQL Filtering"
            },
        ],
        "Medium": [
            {
                "question": "What is the difference between `INNER JOIN` and `LEFT JOIN`?",
                "options": [
                    "INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table plus matches",
                    "They are identical",
                    "LEFT JOIN is faster than INNER JOIN",
                    "INNER JOIN includes NULLs, LEFT JOIN does not"
                ],
                "correct": 0,
                "explanation": "INNER JOIN returns rows where there's a match in both tables. LEFT JOIN returns all rows from the left table, with NULLs for unmatched right-table rows.",
                "topic": "SQL Joins"
            },
            {
                "question": "What does `GROUP BY` do in SQL?",
                "options": [
                    "Groups rows with the same values for aggregate functions like COUNT, SUM, AVG",
                    "Sorts the result set alphabetically",
                    "Removes duplicate rows permanently",
                    "Creates a new table"
                ],
                "correct": 0,
                "explanation": "GROUP BY collapses rows with identical values in the specified columns, allowing aggregate functions to operate on each group.",
                "topic": "SQL Aggregation"
            },
        ],
        "Hard": [
            {
                "question": "What is a correlated subquery in SQL?",
                "options": [
                    "A subquery that references columns from the outer query and is re-evaluated for each row",
                    "A subquery that runs in parallel with the main query",
                    "A subquery that always returns a single row",
                    "A subquery that uses GROUP BY"
                ],
                "correct": 0,
                "explanation": "A correlated subquery depends on the outer query's current row. It's re-executed once per outer row, which can be slow but enables row-dependent filtering.",
                "topic": "SQL Advanced"
            },
        ],
    },
    "machine learning": {
        "Easy": [
            {
                "question": "What is the primary goal of supervised learning?",
                "options": [
                    "Learn a mapping function from input features to known output labels",
                    "Discover hidden patterns in unlabeled data",
                    "Generate new data similar to training data",
                    "Compress data for storage"
                ],
                "correct": 0,
                "explanation": "Supervised learning trains on labeled examples (X, y) to learn a function f(X) ≈ y that can predict outputs for new inputs.",
                "topic": "ML Fundamentals"
            },
            {
                "question": "Which metric is most appropriate for evaluating a binary classifier on imbalanced data?",
                "options": ["Accuracy", "F1-Score", "R-squared", "Mean Absolute Error"],
                "correct": 1,
                "explanation": "F1-Score balances precision and recall, making it more robust than accuracy for imbalanced datasets where the majority class dominates.",
                "topic": "ML Evaluation"
            },
        ],
        "Medium": [
            {
                "question": "What is the bias-variance tradeoff?",
                "options": [
                    "Models with high bias underfit; models with high variance overfit — optimal models balance both",
                    "Increasing model complexity always improves performance",
                    "Training data should always be maximized",
                    "Regularization eliminates all errors"
                ],
                "correct": 0,
                "explanation": "Bias measures how far model predictions are from actual values (underfitting). Variance measures sensitivity to training data changes (overfitting). The goal is to minimize total error = bias² + variance + noise.",
                "topic": "ML Theory"
            },
            {
                "question": "What does regularization (L1/L2) do in a model?",
                "options": [
                    "Adds a penalty term to the loss function to prevent overfitting",
                    "Increases model complexity",
                    "Removes feature normalization",
                    "Forces all predictions to zero"
                ],
                "correct": 0,
                "explanation": "Regularization adds a penalty proportional to model weights (L1: |w|, L2: w²) to the loss function, discouraging overly complex models and reducing overfitting.",
                "topic": "ML Optimization"
            },
        ],
        "Hard": [
            {
                "question": "In a neural network, what is vanishing gradient and how do you mitigate it?",
                "options": [
                    "Gradients shrink exponentially in deep layers; use ReLU, batch normalization, or residual connections",
                    "Gradients become infinite; reduce learning rate",
                    "Weights reset to zero; increase batch size",
                    "Output layer fails; add more layers"
                ],
                "correct": 0,
                "explanation": "Vanishing gradients occur when gradients become very small during backpropagation through many layers. Solutions: ReLU activation (avoids saturation), batch normalization, skip connections (ResNets), and proper weight initialization.",
                "topic": "Deep Learning"
            },
        ],
    },
    "data structures": {
        "Easy": [
            {
                "question": "What data structure uses FIFO (First In, First Out) ordering?",
                "options": ["Stack", "Queue", "Binary Tree", "Hash Map"],
                "correct": 1,
                "explanation": "A Queue follows FIFO — the first element added is the first one removed, like a real-world queue/line.",
                "topic": "Data Structures Basics"
            },
            {
                "question": "What is the time complexity of searching in an unsorted array?",
                "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                "correct": 2,
                "explanation": "Without any ordering, you must check each element sequentially, resulting in O(n) linear search.",
                "topic": "Complexity Analysis"
            },
        ],
        "Medium": [
            {
                "question": "What is the difference between BFS and DFS?",
                "options": [
                    "BFS uses a queue (level-order), DFS uses a stack/recursion (depth-first)",
                    "They are the same algorithm",
                    "BFS is always faster than DFS",
                    "DFS requires a queue, BFS requires a stack"
                ],
                "correct": 0,
                "explanation": "BFS explores all neighbors at the current depth before moving deeper (uses a queue). DFS explores as deep as possible before backtracking (uses a stack or recursion).",
                "topic": "Graph Algorithms"
            },
        ],
        "Hard": [
            {
                "question": "When would you use a Red-Black Tree over an AVL Tree?",
                "options": [
                    "When insertions/deletions are frequent — Red-Black Trees have fewer rotations",
                    "When lookups are the only operation — AVL is always better",
                    "They are always equivalent",
                    "When you need O(1) lookup"
                ],
                "correct": 0,
                "explanation": "Red-Black Trees allow at most 2 rotations per insert/delete vs AVL's potentially O(log n). For write-heavy workloads, Red-Black Trees are preferred. AVL trees are better for read-heavy workloads due to stricter balancing.",
                "topic": "Tree Data Structures"
            },
        ],
    },
    "statistics": {
        "Easy": [
            {
                "question": "What does standard deviation measure?",
                "options": [
                    "The spread or dispersion of data points from the mean",
                    "The central tendency of data",
                    "The correlation between variables",
                    "The number of data points"
                ],
                "correct": 0,
                "explanation": "Standard deviation quantifies how much individual data points deviate from the mean. Higher SD means more spread.",
                "topic": "Descriptive Statistics"
            },
        ],
        "Medium": [
            {
                "question": "What is the Central Limit Theorem (CLT)?",
                "options": [
                    "The sampling distribution of the mean approaches a normal distribution as sample size increases, regardless of population distribution",
                    "All data is normally distributed",
                    "Larger samples always give better results",
                    "The mean always equals the median"
                ],
                "correct": 0,
                "explanation": "CLT states that for sufficiently large samples (n≥30), the sampling distribution of the mean is approximately normal, regardless of the underlying population distribution. This is foundational for hypothesis testing.",
                "topic": "Statistical Theory"
            },
        ],
        "Hard": [
            {
                "question": "In stratified sampling, what is the key advantage over simple random sampling?",
                "options": [
                    "It ensures representation from each subgroup (stratum), reducing sampling error for heterogeneous populations",
                    "It's always cheaper to implement",
                    "It requires smaller sample sizes in all cases",
                    "It eliminates the need for randomization"
                ],
                "correct": 0,
                "explanation": "Stratified sampling divides the population into homogeneous subgroups and samples from each, ensuring representation and often reducing variance compared to SRS, especially when strata differ significantly.",
                "topic": "Sampling Methods"
            },
        ],
    },
}

# Default fallback questions for skills not in the bank
DEFAULT_QUESTIONS = {
    "Easy": [
        {
            "question": "What is the most important fundamental concept in this field?",
            "options": ["Understanding core principles", "Memorizing formulas", "Speed of execution", "Using the latest tools"],
            "correct": 0,
            "explanation": "Strong foundational understanding enables problem-solving and adaptation. Memorization alone is insufficient for professional competency.",
            "topic": "Fundamentals"
        },
    ],
    "Medium": [
        {
            "question": "What is the best approach to solving a complex problem in this domain?",
            "options": ["Break it into smaller sub-problems and solve systematically", "Try random solutions until one works", "Copy existing solutions", "Skip to the final answer"],
            "correct": 0,
            "explanation": "Decomposition is a core problem-solving strategy. Breaking complex problems into manageable parts leads to systematic, correct solutions.",
            "topic": "Problem Solving"
        },
    ],
    "Hard": [
        {
            "question": "How do you evaluate the quality and reliability of your work in this field?",
            "options": ["Through systematic testing, peer review, and validation against benchmarks", "By personal intuition alone", "By checking if it runs without errors", "By comparing with the easiest solution"],
            "correct": 0,
            "explanation": "Professional quality assurance requires systematic validation methods, not just surface-level checks.",
            "topic": "Quality Assurance"
        },
    ],
}


def _get_questions_for_skill(skill_name: str, difficulty: str, count: int = 1) -> List[Dict[str, Any]]:
    """Get questions for a skill at a given difficulty level."""
    skill_lower = skill_name.lower()
    
    # Find matching question bank
    bank = None
    for key in QUESTION_BANK:
        if key in skill_lower or skill_lower in key:
            bank = QUESTION_BANK[key]
            break
    
    if not bank:
        # Try partial matching
        for key in QUESTION_BANK:
            if any(word in skill_lower for word in key.split()) or any(word in key for word in skill_lower.split()):
                bank = QUESTION_BANK[key]
                break
    
    if not bank:
        bank = DEFAULT_QUESTIONS
    
    # Get questions at requested difficulty, fallback to available
    questions = bank.get(difficulty, [])
    if not questions:
        # Fallback chain
        for fallback in DIFFICULTY_LEVELS:
            if fallback in bank and bank[fallback]:
                questions = bank[fallback]
                break
    
    if not questions:
        questions = DEFAULT_QUESTIONS.get(difficulty, DEFAULT_QUESTIONS["Medium"])
    
    # Ensure we have enough questions
    import random
    selected = []
    while len(selected) < count:
        for q in questions:
            if len(selected) >= count:
                break
            # Avoid duplicates
            if q["question"] not in [s["question"] for s in selected]:
                selected.append(q.copy())
    
    return selected


def _evaluate_answer(question: Dict[str, Any], user_answer: int) -> Dict[str, Any]:
    """Evaluate user's answer and return result."""
    is_correct = user_answer == question["correct"]
    return {
        "is_correct": is_correct,
        "correct_answer": question["correct"],
        "correct_answer_text": question["options"][question["correct"]],
        "explanation": question["explanation"],
        "topic": question.get("topic", "General"),
    }


def _adjust_difficulty(current_difficulty: str, is_correct: bool, consecutive_correct: int, consecutive_wrong: int) -> str:
    """Adjust difficulty based on performance."""
    idx = DIFFICULTY_LEVELS.index(current_difficulty)
    
    if is_correct and consecutive_correct >= 2:
        # Move up
        new_idx = min(idx + 1, len(DIFFICULTY_LEVELS) - 1)
        return DIFFICULTY_LEVELS[new_idx]
    elif not is_correct and consecutive_wrong >= 2:
        # Move down
        new_idx = max(idx - 1, 0)
        return DIFFICULTY_LEVELS[new_idx]
    
    return current_difficulty


def _compute_competency_score(results: List[Dict[str, Any]], starting_difficulty: str) -> Dict[str, Any]:
    """Compute final competency score from interview results."""
    if not results:
        return {"score": 0, "level": "beginner", "details": {}}
    
    total = len(results)
    correct = sum(1 for r in results if r["is_correct"])
    
    # Base accuracy (0-100)
    accuracy = (correct / total) * 100
    
    # Difficulty multiplier
    difficulty_weights = {"Easy": 0.6, "Medium": 0.8, "Hard": 1.0, "Expert": 1.2}
    avg_difficulty_weight = sum(
        difficulty_weights.get(r.get("difficulty", "Medium"), 0.8) for r in results
    ) / total
    
    # Compute weighted score
    raw_score = accuracy * avg_difficulty_weight
    
    # Clamp to 0-100
    final_score = round(min(max(raw_score, 0), 100), 1)
    
    # Classify
    gap_info = classify_gap(final_score)
    
    # Identify strong and weak topics
    topic_results = {}
    for r in results:
        topic = r.get("topic", "General")
        if topic not in topic_results:
            topic_results[topic] = {"correct": 0, "total": 0}
        topic_results[topic]["total"] += 1
        if r["is_correct"]:
            topic_results[topic]["correct"] += 1
    
    strong_topics = [t for t, v in topic_results.items() if v["correct"] == v["total"]]
    weak_topics = [t for t, v in topic_results.items() if v["correct"] < v["total"]]
    
    return {
        "score": final_score,
        "level": gap_info["level"],
        "label": gap_info["label"],
        "color": gap_info["color"],
        "accuracy": round(accuracy, 1),
        "questions_answered": total,
        "correct_count": correct,
        "difficulty_reached": results[-1].get("difficulty", "Medium") if results else starting_difficulty,
        "strong_topics": strong_topics,
        "weak_topics": weak_topics,
        "topic_breakdown": {t: {"accuracy": round(v["correct"] / v["total"] * 100, 1)} for t, v in topic_results.items()},
    }


@router.get("/skills")
async def get_available_skills(current_user: dict = Depends(get_current_user)):
    """Get list of skills available for competency interview."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, category FROM skills ORDER BY name")
        skills = [dict(r) for r in cursor.fetchall()]
    
    # Also include common skills from question bank
    bank_skills = [
        {"id": "skill_python", "name": "Python", "category": "Programming"},
        {"id": "skill_sql", "name": "SQL", "category": "Database"},
        {"id": "skill_ml", "name": "Machine Learning", "category": "Data Science"},
        {"id": "skill_dsa", "name": "Data Structures & Algorithms", "category": "Computer Science"},
        {"id": "skill_stats", "name": "Statistics", "category": "Mathematics"},
    ]
    
    # Merge, avoiding duplicates
    existing_names = {s["name"].lower() for s in skills}
    for bs in bank_skills:
        if bs["name"].lower() not in existing_names:
            skills.append(bs)
    
    return {"skills": skills}


@router.post("/start")
async def start_interview(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Start a new competency interview session. Returns the first question."""
    skill_name = payload.get("skill", "Python")
    difficulty = payload.get("difficulty", "Medium")
    
    if difficulty not in DIFFICULTY_LEVELS:
        difficulty = "Medium"
    
    # Get first question
    questions = _get_questions_for_skill(skill_name, difficulty, 1)
    if not questions:
        raise HTTPException(status_code=404, detail=f"No questions available for '{skill_name}'")
    
    q = questions[0]
    session_id = str(uuid.uuid4())
    
    # Store session state in DB
    session_data = {
        "skill": skill_name,
        "difficulty": difficulty,
        "questions_asked": 0,
        "correct_count": 0,
        "consecutive_correct": 0,
        "consecutive_wrong": 0,
        "results": [],
        "started_at": time.time(),
    }
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO ai_interactions (id, user_id, session_id, role, message, tokens_used)
            VALUES (?, ?, ?, 'system', ?, 0)
        """, (
            f"ci_{session_id[:8]}",
            current_user["id"],
            f"competency_interview:{session_id}",
            json.dumps(session_data)
        ))
    
    return {
        "session_id": session_id,
        "skill": skill_name,
        "difficulty": difficulty,
        "question_number": 1,
        "total_questions": TOTAL_QUESTIONS,
        "question": {
            "id": f"q_{session_id[:8]}_1",
            "text": q["question"],
            "options": q["options"],
            "topic": q.get("topic", "General"),
            "difficulty": difficulty,
        }
    }


@router.post("/answer")
async def submit_answer(payload: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Submit an answer and get the next question (or final results)."""
    session_id = payload.get("session_id", "")
    question_index = payload.get("question_index", 0)
    user_answer = payload.get("answer", -1)
    skill_name = payload.get("skill", "Python")
    current_difficulty = payload.get("difficulty", "Medium")
    
    # Retrieve session
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM ai_interactions 
            WHERE user_id = ? AND session_id = ? 
            ORDER BY created_at DESC LIMIT 1
        """, (current_user["id"], f"competency_interview:{session_id}"))
        row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new interview.")
    
    session_data = json.loads(row["message"])
    
    # Get the question that was asked
    prev_questions = _get_questions_for_skill(skill_name, current_difficulty, 1)
    current_q = prev_questions[0] if prev_questions else None
    
    # Evaluate answer
    if current_q:
        eval_result = _evaluate_answer(current_q, user_answer)
        eval_result["difficulty"] = current_difficulty
        session_data["results"].append(eval_result)
        session_data["questions_asked"] += 1
        
        if eval_result["is_correct"]:
            session_data["correct_count"] += 1
            session_data["consecutive_correct"] += 1
            session_data["consecutive_wrong"] = 0
        else:
            session_data["consecutive_correct"] = 0
            session_data["consecutive_wrong"] += 1
        
        # Adjust difficulty
        new_difficulty = _adjust_difficulty(
            current_difficulty,
            eval_result["is_correct"],
            session_data["consecutive_correct"],
            session_data["consecutive_wrong"]
        )
        session_data["difficulty"] = new_difficulty
    else:
        eval_result = {"is_correct": False, "explanation": "Question not found"}
        new_difficulty = current_difficulty
    
    # Check if interview is complete
    if session_data["questions_asked"] >= TOTAL_QUESTIONS:
        # Compute final score
        competency = _compute_competency_score(session_data["results"], session_data.get("difficulty", "Medium"))
        
        # Update user's skill competency in the database
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Find or create skill
            cursor.execute("SELECT id FROM skills WHERE name LIKE ? LIMIT 1", (f"%{skill_name}%",))
            skill_row = cursor.fetchone()
            
            if skill_row:
                skill_id = skill_row["id"]
            else:
                skill_id = str(uuid.uuid4())
                cursor.execute("""
                    INSERT INTO skills (id, name, category, description)
                    VALUES (?, ?, 'AI Assessment', 'Competency assessed via AI Interview')
                """, (skill_id, skill_name))
            
            # Check if user has this skill
            cursor.execute("""
                SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?
            """, (current_user["id"], skill_id))
            us_row = cursor.fetchone()
            
            if us_row:
                # Update existing
                cursor.execute("""
                    UPDATE user_skills
                    SET assessment_score = ?, competency_score = ?,
                        gap_level = ?, last_evaluated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (competency["score"], competency["score"], competency["level"], us_row["id"]))
            else:
                # Insert new
                from backend.services.competency_service import classify_gap
                gap_info = classify_gap(competency["score"])
                cursor.execute("""
                    INSERT INTO user_skills (
                        id, user_id, skill_id, self_rating, quiz_score, assessment_score,
                        course_completion, learning_activity, competency_score, gap_level
                    ) VALUES (?, ?, ?, ?, 0, ?, 0, 30, ?, ?)
                """, (
                    str(uuid.uuid4()), current_user["id"], skill_id,
                    competency["level"], competency["score"],
                    competency["score"], competency["level"]
                ))
            
            # Record score history
            cursor.execute("""
                INSERT INTO competency_scores (id, user_id, skill_id, score, recorded_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (str(uuid.uuid4()), current_user["id"], skill_id, competency["score"]))
        
        # Save completion to session
        session_data["completed"] = True
        session_data["competency"] = competency
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE ai_interactions SET message = ?
                WHERE user_id = ? AND session_id = ?
            """, (json.dumps(session_data), current_user["id"], f"competency_interview:{session_id}"))
        
        return {
            "completed": True,
            "evaluation": eval_result,
            "competency": competency,
            "message": f"Interview complete! Your {skill_name} competency is {competency['score']}% ({competency['label']})."
        }
    
    # Not done yet — generate next question
    next_questions = _get_questions_for_skill(skill_name, new_difficulty, 1)
    next_q = next_questions[0] if next_questions else None
    
    # Save updated session
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE ai_interactions SET message = ?
            WHERE user_id = ? AND session_id = ?
        """, (json.dumps(session_data), current_user["id"], f"competency_interview:{session_id}"))
    
    return {
        "completed": False,
        "evaluation": eval_result,
        "next_question": {
            "id": f"q_{session_id[:8]}_{session_data['questions_asked'] + 1}",
            "text": next_q["question"] if next_q else "No more questions available.",
            "options": next_q["options"] if next_q else [],
            "topic": next_q.get("topic", "General") if next_q else "General",
            "difficulty": new_difficulty,
        },
        "progress": {
            "current": session_data["questions_asked"],
            "total": TOTAL_QUESTIONS,
            "correct_so_far": session_data["correct_count"],
            "difficulty": new_difficulty,
        }
    }
