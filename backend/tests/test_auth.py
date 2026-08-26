import pytest
from backend.services.auth_service import hash_password, verify_password, create_access_token, authenticate_user
from backend.services.seed_service import seed_database

@pytest.fixture(autouse=True)
def setup_db():
    seed_database(force=False)

def test_password_hashing():
    pwd = "MySecretPassword123"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_demo_logins():
    # Student Demo
    student = authenticate_user("demo.student@skillsphere.ai", "Demo@123")
    assert student is not None
    assert student["role"] == "student"
    assert student["email"] == "demo.student@skillsphere.ai"
    
    # Instructor Demo
    instructor = authenticate_user("demo.instructor@skillsphere.ai", "Demo@123")
    assert instructor is not None
    assert instructor["role"] == "instructor"
    
    # Admin Demo
    admin = authenticate_user("demo.admin@skillsphere.ai", "Demo@123")
    assert admin is not None
    assert admin["role"] == "admin"

def test_jwt_token_generation():
    token = create_access_token({"sub": "test_user_id", "role": "student"})
    assert isinstance(token, str)
    assert len(token) > 20
