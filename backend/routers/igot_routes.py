from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from backend.services.auth_service import get_current_user
from backend.services.igot_service import igot_service
from backend.schemas import IGOTSyncRequest

router = APIRouter(prefix="/igot", tags=["iGOT Karmayogi Integration"])

@router.get("/status")
async def get_igot_status(current_user: dict = Depends(get_current_user)):
    return igot_service.get_status()

@router.get("/competencies")
async def get_igot_competencies(current_user: dict = Depends(get_current_user)):
    return igot_service.get_competencies()

@router.get("/courses")
async def get_igot_courses(current_user: dict = Depends(get_current_user)):
    return igot_service.get_external_courses()

@router.post("/sync")
async def trigger_sync(payload: IGOTSyncRequest, current_user: dict = Depends(get_current_user)):
    return igot_service.trigger_synchronization(
        user_id=current_user["id"],
        sync_type=payload.sync_direction
    )

@router.get("/history")
async def get_sync_history(current_user: dict = Depends(get_current_user)):
    return igot_service.get_sync_history()
