import pytest
from backend.services.quiz_service import create_quiz_with_ai, get_quiz_details, evaluate_and_submit_quiz
from backend.services.document_service import chunk_text, extract_topics_and_summary
from backend.services.seed_service import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    seed_database(force=False)

def test_quiz_generation_and_evaluation():
    # 1. Generate Quiz
    quiz_res = create_quiz_with_ai(
        user_id="student_ravi_01",
        topic="Machine Learning Optimization",
        difficulty="Medium",
        question_count=3,
        question_type="mcq"
    )
    assert quiz_res["total_questions"] == 3
    assert len(quiz_res["questions"]) == 3
    
    quiz_id = quiz_res["id"]
    
    # 2. Get quiz details for student (should not leak answers)
    details = get_quiz_details(quiz_id, include_answers=False)
    assert details is not None
    assert "correct_answer" not in details["questions"][0]
    
    # 3. Submit answers
    submissions = [
        {"question_id": details["questions"][0]["id"], "user_answer": "A"},
        {"question_id": details["questions"][1]["id"], "user_answer": "B"},
        {"question_id": details["questions"][2]["id"], "user_answer": "C"}
    ]
    eval_res = evaluate_and_submit_quiz(
        user_id="student_ravi_01",
        quiz_id=quiz_id,
        submissions=submissions,
        time_spent_seconds=45
    )
    
    assert "percentage" in eval_res
    assert "adaptive_feedback" in eval_res
    assert eval_res["total_questions"] == 3

def test_document_chunking_and_topics():
    sample_text = """# Deep Learning Architectures
Deep learning is a subset of machine learning based on artificial neural networks.

## Convolutional Neural Networks
CNNs are specialized for grid data like images. They use kernel convolutions to extract feature hierarchies.

## Recurrent Neural Networks
RNNs process sequential inputs by maintaining hidden state across time steps."""

    chunks = chunk_text(sample_text, chunk_size=150)
    assert len(chunks) >= 2
    
    topics, summary = extract_topics_and_summary(sample_text, "Deep Learning Notes")
    assert len(topics) >= 1
    assert len(summary) > 20
