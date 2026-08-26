import uuid
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from datetime import datetime
from backend.database import get_db

class LearningProvider(ABC):
    @abstractmethod
    def fetch_courses(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def fetch_competency_framework(self) -> List[Dict[str, Any]]:
        pass
        
    @abstractmethod
    def sync_learning_record(self, user_id: str, record: Dict[str, Any]) -> Dict[str, Any]:
        pass

class DemoProvider(LearningProvider):
    def fetch_courses(self) -> List[Dict[str, Any]]:
        return [
            {
                "igot_course_id": "IGOT-MOSPI-101",
                "title": "National Statistical Systems & Data Governance",
                "department": "MoSPI",
                "competency_code": "IGOT-STAT-401",
                "level": "Intermediate",
                "credits": 4.0
            },
            {
                "igot_course_id": "IGOT-MOSPI-202",
                "title": "Machine Learning for Public Policy & Census Analytics",
                "department": "MoSPI / Digital India",
                "competency_code": "IGOT-AI-105",
                "level": "Advanced",
                "credits": 5.0
            },
            {
                "igot_course_id": "IGOT-GOV-303",
                "title": "Digital Governance & Cybersecurity Compliance",
                "department": "MeitY / Karmayogi Bharat",
                "competency_code": "IGOT-GOV-302",
                "level": "Beginner",
                "credits": 3.0
            }
        ]

    def fetch_competency_framework(self) -> List[Dict[str, Any]]:
        return [
            {
                "code": "IGOT-AI-105",
                "name": "Applied Artificial Intelligence & Machine Learning",
                "domain": "Emerging Technologies",
                "mapped_skills": ["Machine Learning", "Artificial Intelligence", "Python"],
                "target_proficiency": "Level 3 - Operational Mastery"
            },
            {
                "code": "IGOT-STAT-401",
                "name": "Statistical Sampling & Survey Methodologies",
                "domain": "Data Analytics & Statistics",
                "mapped_skills": ["Database Management Systems", "SQL", "Data Analysis"],
                "target_proficiency": "Level 4 - Advanced Expert"
            },
            {
                "code": "IGOT-DATA-204",
                "name": "Data Structures & Computational Problem Solving",
                "domain": "Core Computing",
                "mapped_skills": ["Data Structures", "Algorithms", "Java Programming"],
                "target_proficiency": "Level 3 - Operational Mastery"
            },
            {
                "code": "IGOT-GOV-302",
                "name": "Enterprise Information Security & Governance",
                "domain": "Governance & Compliance",
                "mapped_skills": ["Cybersecurity", "Web Development"],
                "target_proficiency": "Level 2 - Foundational Competency"
            }
        ]

    def sync_learning_record(self, user_id: str, record: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "synchronized",
            "receipt_id": f"IGOT-SYNC-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.utcnow().isoformat(),
            "provider": "DemoProvider (iGOT Karmayogi Mock Engine)"
        }

class IGOTService:
    def __init__(self, provider: LearningProvider = None):
        self.provider = provider or DemoProvider()
        
    def get_status(self) -> Dict[str, Any]:
        return {
            "service_name": "iGOT Karmayogi Integration Gateway",
            "status": "Connected (Mock Adapter Active)",
            "environment": "Prototype / Staging Sandbox",
            "endpoint": "https://api.sandbox.igotkarmayogi.gov.in/v1",
            "last_heartbeat": datetime.utcnow().isoformat(),
            "active_provider": self.provider.__class__.__name__,
            "compliance": "MoSPI Capacity Building & National Competency Framework v2.0"
        }
        
    def get_competencies(self) -> List[Dict[str, Any]]:
        return self.provider.fetch_competency_framework()
        
    def get_external_courses(self) -> List[Dict[str, Any]]:
        return self.provider.fetch_courses()
        
    def trigger_synchronization(self, user_id: str, sync_type: str = "full") -> Dict[str, Any]:
        sync_id = str(uuid.uuid4())
        record = {
            "user_id": user_id,
            "type": sync_type,
            "initiated_at": datetime.utcnow().isoformat()
        }
        sync_res = self.provider.sync_learning_record(user_id, record)
        
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO igot_sync_logs (id, sync_type, status, records_synced, details_json)
                VALUES (?, ?, 'success', ?, ?)
            """, (sync_id, sync_type, 12, json.dumps(sync_res)))
            
            # Add audit log
            cursor.execute("""
                INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details_json)
                VALUES (?, ?, 'IGOT_SYNC', 'integration', ?, ?)
            """, (str(uuid.uuid4()), user_id, sync_id, json.dumps({"provider": "iGOT Karmayogi", "result": sync_res})))
            
        return {
            "sync_id": sync_id,
            "status": "success",
            "message": "Successfully synchronized competency profiles and course milestones with iGOT Karmayogi registry.",
            "synced_records": 12,
            "provider_response": sync_res
        }
        
    def get_sync_history(self) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM igot_sync_logs ORDER BY synced_at DESC LIMIT 15")
            return [dict(r) for r in cursor.fetchall()]

igot_service = IGOTService()
