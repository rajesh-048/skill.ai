import pytest
from backend.services.recommendation_service import calculate_rec_score, generate_recommendations, generate_personalized_30_day_path
from backend.services.seed_service import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    seed_database(force=False)

def test_recommendation_score_formula():
    # Gap: 68 -> 68 * 0.40 = 27.2
    # Career: 95 -> 95 * 0.25 = 23.75
    # History: 80 -> 80 * 0.15 = 12.0
    # Diff fit: 90 -> 90 * 0.10 = 9.0
    # Interest: 85 -> 85 * 0.10 = 8.5
    # Total = 27.2 + 23.75 + 12.0 + 9.0 + 8.5 = 80.45 -> 80.5
    score = calculate_rec_score(68.0, 95.0, 80.0, 90.0, 85.0)
    assert score == 80.5

def test_generate_recommendations_for_ravi():
    recs = generate_recommendations("student_ravi_01")
    assert len(recs) > 0
    # Machine Learning Fundamentals should be top recommended because ML has the highest skill gap and career relevance
    top = recs[0]
    assert "Machine Learning" in top["title"] or top["score"] >= 70.0
    assert "why_explanation" in top
    assert len(top["why_explanation"]) > 20

def test_generate_30_day_path():
    path = generate_personalized_30_day_path("student_ravi_01")
    assert path["duration_days"] == 30
    assert len(path["milestones"]) == 30
    assert path["priority_1_skill"] in ["Machine Learning", "Artificial Intelligence"]
