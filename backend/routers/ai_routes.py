import uuid
import json
import time
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from backend.config import settings
from backend.database import get_db
from backend.services.auth_service import get_current_user
from backend.services.ai_service import ai_service
from backend.services.competency_service import get_learner_competency_overview
from backend.schemas import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/ai", tags=["AI Mentor & Services"])


def _build_user_context(current_user: dict, document_id: str | None = None) -> tuple[dict, str | None, str | None]:
    """Shared helper: build user context + optional document context for chat endpoints."""
    comp_overview = get_learner_competency_overview(current_user["id"])
    crit_gaps = [g["skill_name"] for g in comp_overview.get("critical_gaps", [])]
    user_context = {
        "full_name": current_user.get("profile", {}).get("full_name", "Student"),
        "career_goal": current_user.get("profile", {}).get("career_goal", "AI/ML Engineer"),
        "skills_summary": ", ".join([
            f"{s['skill_name']} ({s['score']}%)"
            for s in comp_overview.get("skills", [])[:4]
        ]),
        "critical_gap": crit_gaps[0] if crit_gaps else "Machine Learning",
    }
    doc_context = None
    doc_title = None
    if document_id:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
            doc_row = cursor.fetchone()
            if doc_row:
                doc_title = doc_row["title"]
                cursor.execute(
                    "SELECT content FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC LIMIT 4",
                    (document_id,),
                )
                doc_context = "\n\n".join(r["content"] for r in cursor.fetchall())
    return user_context, doc_context, doc_title


@router.get("/health")
async def ai_health_check():
    """Ping the configured AI provider and report MiMo / model status."""
    provider = "none"
    model = ai_service.model or "unknown"
    api_configured = ai_service.is_live_ai_available()
    latency_ms = None
    status = "not_configured"
    error = None

    if settings.OPENROUTER_API_KEY:
        provider = "openrouter"
    elif settings.OPENAI_API_KEY:
        provider = "openai"

    if api_configured:
        try:
            start = time.time()
            response = ai_service._call_with_retry(
                model=ai_service.model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=5,
                temperature=0,
            )
            latency_ms = round((time.time() - start) * 1000)
            status = "healthy"
        except Exception as e:
            status = "error"
            error = str(e)[:200]

    return {
        "status": status,
        "provider": provider,
        "model": model,
        "api_configured": api_configured,
        "latency_ms": latency_ms,
        "error": error,
    }

@router.post("/chat/stream")
async def chat_with_mentor_stream(payload: AIChatRequest, current_user: dict = Depends(get_current_user)):
    """Stream MiMo responses via Server-Sent Events.
    
    Each event has the format:
      event: <type>    (token | citations | suggested | done)
      data: <json>
    """
    user_context, doc_context, doc_title = _build_user_context(current_user, payload.document_id)

    def event_generator():
        for event in ai_service.chat_mentor_stream(
            user_message=payload.message,
            session_id=payload.session_id or "default",
            user_context=user_context,
            document_context=doc_context,
            document_title=doc_title,
        ):
            event_type = event["type"]
            data = json.dumps(event["content"], ensure_ascii=False)
            yield f"event: {event_type}\ndata: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_mentor(payload: AIChatRequest, current_user: dict = Depends(get_current_user)):
    user_context, doc_context, doc_title = _build_user_context(current_user, payload.document_id)

    result = ai_service.chat_mentor(
        user_message=payload.message,
        session_id=payload.session_id or "default",
        user_context=user_context,
        document_context=doc_context,
        document_title=doc_title,
    )

    # Log interaction
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO ai_interactions (id, user_id, session_id, role, message, tokens_used) VALUES (?, ?, ?, 'user', ?, 50)",
            ("ai_msg_" + current_user["id"][:4], current_user["id"], payload.session_id or "default", payload.message),
        )

    return result

@router.get("/insights")
async def get_ai_insights(current_user: dict = Depends(get_current_user)):
    comp_data = get_learner_competency_overview(current_user["id"])
    crit_gaps = comp_data.get("critical_gaps", [])
    crit_name = crit_gaps[0]["skill_name"] if crit_gaps else "Machine Learning"
    
    return {
        "weekly_insight": f"Your Data Structures performance improved by +12% this week. Your primary remaining gap is {crit_name}. We recommend 2 practice quiz sessions this week.",
        "strengths": ["Python Programming & Syntax", "SQL Queries & Schema Design"],
        "growth_areas": [crit_name, "Tree Traversal in DSA"],
        "recommended_action": f"Complete Day 4 of your 30-Day Personalized Path to advance in {crit_name}."
    }
