"""
End-to-end endpoint verification for SkillSphere AI
Run from d:\sih directory as: python -m backend.tests.verify_endpoints
"""
import json
import sys
from fastapi.testclient import TestClient
sys.path.insert(0, 'D:\\sih')
from backend.main import app

client = TestClient(app)

def run():
    passed = 0
    failed = 0

    def ok(label):
        nonlocal passed
        passed += 1
        print(f'  PASS  {label}')

    def fail(label, reason):
        nonlocal failed
        failed += 1
        print(f'  FAIL  {label} -> {reason}')

    # 1. Health
    try:
        r = client.get('/api/health')
        assert r.status_code == 200
        ok('GET /api/health')
    except Exception as e:
        fail('GET /api/health', str(e))

    # 2. Student demo login
    try:
        r = client.post('/api/auth/demo-login', json={'role': 'student'})
        assert r.status_code == 200
        student_token = r.json()['access_token']
        ok('POST /api/auth/demo-login [student]')
    except Exception as e:
        fail('POST /api/auth/demo-login [student]', str(e))
        student_token = None

    sh = {'Authorization': f'Bearer {student_token}'} if student_token else {}

    # 3. Student Dashboard
    try:
        r = client.get('/api/student/dashboard', headers=sh)
        assert r.status_code == 200
        d = r.json()
        assert 'overall_learning_score' in d
        assert len(d['skills']) > 0
        ok(f'GET /api/student/dashboard (score={d["overall_learning_score"]}%, skills={len(d["skills"])})')
    except Exception as e:
        fail('GET /api/student/dashboard', str(e))

    # 4. Learning Path
    try:
        r = client.get('/api/student/learning-path', headers=sh)
        assert r.status_code == 200
        p = r.json()
        assert len(p['milestones']) == 30
        ok(f'GET /api/student/learning-path (30 milestones generated)')
    except Exception as e:
        fail('GET /api/student/learning-path', str(e))

    # 5. Courses
    try:
        r = client.get('/api/courses')
        assert r.status_code == 200
        courses = r.json()
        assert len(courses) >= 8
        ok(f'GET /api/courses ({len(courses)} courses)')
    except Exception as e:
        fail('GET /api/courses', str(e))

    # 6. Quiz generation
    try:
        r = client.post('/api/quizzes/generate', headers=sh, json={
            'topic': 'Machine Learning Fundamentals',
            'difficulty': 'Medium',
            'question_count': 3,
            'question_type': 'mcq'
        })
        assert r.status_code == 200
        quiz = r.json()['quiz']
        ok(f'POST /api/quizzes/generate ({quiz["total_questions"]} Qs, topic: {quiz["skill_name"]})')
    except Exception as e:
        fail('POST /api/quizzes/generate', str(e))

    # 7. AI Mentor chat
    try:
        r = client.post('/api/ai/chat', headers=sh, json={
            'message': 'Explain gradient descent in simple terms',
            'session_id': 'test_verify'
        })
        assert r.status_code == 200
        resp = r.json()
        ok(f'POST /api/ai/chat (reply length={len(resp.get("reply",""))} chars)')
    except Exception as e:
        fail('POST /api/ai/chat', str(e))

    # 8. iGOT Integration
    try:
        r = client.get('/api/igot/status', headers=sh)
        assert r.status_code == 200
        r2 = client.get('/api/igot/competencies', headers=sh)
        assert r2.status_code == 200
        ok(f'GET /api/igot/* ({len(r2.json())} competency frameworks)')
    except Exception as e:
        fail('GET /api/igot/*', str(e))

    # 9. Instructor portal
    try:
        r_inst = client.post('/api/auth/demo-login', json={'role': 'instructor'})
        ih = {'Authorization': f'Bearer {r_inst.json()["access_token"]}'}
        r = client.get('/api/instructor/dashboard', headers=ih)
        assert r.status_code == 200
        r2 = client.get('/api/instructor/heatmap', headers=ih)
        assert r2.status_code == 200
        hm = r2.json()
        ok(f'Instructor portal ({len(hm["matrix"])} students in heatmap)')
    except Exception as e:
        fail('Instructor portal', str(e))

    # 10. Admin portal
    try:
        r_admin = client.post('/api/auth/demo-login', json={'role': 'admin'})
        ah = {'Authorization': f'Bearer {r_admin.json()["access_token"]}'}
        r = client.get('/api/admin/stats', headers=ah)
        assert r.status_code == 200
        r2 = client.get('/api/admin/users', headers=ah)
        assert r2.status_code == 200
        r3 = client.get('/api/admin/audit-logs', headers=ah)
        assert r3.status_code == 200
        ok(f'Admin portal (stats + users + audit logs)')
    except Exception as e:
        fail('Admin portal', str(e))

    # 11. Notifications
    try:
        r = client.get('/api/student/notifications', headers=sh)
        assert r.status_code == 200
        ok('GET /api/student/notifications')
    except Exception as e:
        fail('GET /api/student/notifications', str(e))

    # 12. Achievements
    try:
        r = client.get('/api/student/achievements', headers=sh)
        assert r.status_code == 200
        d = r.json()
        ok(f'GET /api/student/achievements ({d.get("unlocked_count", 0)} badges unlocked)')
    except Exception as e:
        fail('GET /api/student/achievements', str(e))

    # 13. Global search
    try:
        r = client.get('/api/search?q=machine+learning', headers=sh)
        assert r.status_code == 200
        ok('GET /api/search')
    except Exception as e:
        fail('GET /api/search', str(e))

    print(f'\n{"="*60}')
    print(f'  RESULTS: {passed} PASSED, {failed} FAILED')
    if failed == 0:
        print('  ALL ENDPOINT CHECKS PASSED!')
    print(f'{"="*60}')
    return failed == 0

if __name__ == '__main__':
    success = run()
    sys.exit(0 if success else 1)
