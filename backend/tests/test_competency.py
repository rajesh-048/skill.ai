import pytest
from backend.services.competency_service import (
    compute_weighted_score, classify_gap, self_rating_to_score,
    get_learner_competency_overview, recalculate_user_competencies
)
from backend.services.seed_service import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    seed_database(force=False)

def test_weighted_formula():
    # 30% Quiz (80) = 24.0
    # 20% Assessment (70) = 14.0
    # 20% Course Completion (90) = 18.0
    # 15% Self Assessment (65) = 9.75
    # 15% Activity (80) = 12.0
    # Total = 24 + 14 + 18 + 9.75 + 12 = 77.75 -> 77.8
    score = compute_weighted_score(
        quiz_score=80.0,
        assessment_score=70.0,
        course_completion=90.0,
        self_score=65.0,
        activity_score=80.0
    )
    assert score == 77.8

def test_gap_classification_matrix():
    # < 40: Critical Gap
    assert classify_gap(35.0)["level"] == "critical"
    assert classify_gap(39.9)["level"] == "critical"
    
    # 40 - 59: Developing
    assert classify_gap(40.0)["level"] == "developing"
    assert classify_gap(55.0)["level"] == "developing"
    
    # 60 - 79: Proficient
    assert classify_gap(60.0)["level"] == "proficient"
    assert classify_gap(75.0)["level"] == "proficient"
    
    # 80 - 100: Advanced
    assert classify_gap(80.0)["level"] == "advanced"
    assert classify_gap(95.0)["level"] == "advanced"

def test_learner_overview_ravi():
    overview = get_learner_competency_overview("student_ravi_01")
    assert overview["total_skills_tracked"] >= 5
    assert len(overview["critical_gaps"]) >= 1
    # Check that Machine Learning is detected as critical gap
    ml_gap = next((g for g in overview["critical_gaps"] if "Machine Learning" in g["skill_name"] or "AI" in g["skill_name"]), None)
    assert ml_gap is not None
    assert ml_gap["score"] < 40.0
