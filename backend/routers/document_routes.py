import os
import shutil
import uuid
import json
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from backend.config import settings
from backend.database import get_db
from backend.services.auth_service import get_current_user
from backend.services.document_service import process_and_save_document

router = APIRouter(prefix="/documents", tags=["Document Management"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    original_filename = file.filename
    ext = Path(original_filename).suffix.lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{ext}'. Allowed formats are: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
        
    doc_title = title or Path(original_filename).stem.replace("_", " ").replace("-", " ").title()
    
    # Save file to upload directory
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    file_path = settings.UPLOAD_DIR / unique_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)
        
        # Process document
        doc_result = process_and_save_document(
            user_id=current_user["id"],
            title=doc_title,
            original_filename=original_filename,
            file_path=str(file_path),
            file_type=ext,
            file_size=file_size
        )
        
        # Unlock badge if first document upload
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR IGNORE INTO achievements (id, user_id, badge_code, badge_name, badge_description, icon, points_xp)
                VALUES (?, ?, 'doc_explorer', '📚 Document Explorer', 'Uploaded and synthesized custom academic notes with AI', '📚', 75)
            """, (str(uuid.uuid4()), current_user["id"]))
            
        return {
            "status": "success",
            "message": f"Successfully uploaded and processed '{original_filename}'.",
            "document": doc_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Something went wrong while processing the document. Please verify the file and try again. ({str(e)})"
        )

@router.get("")
async def get_user_documents(current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC", (current_user["id"],))
        docs = []
        for r in cursor.fetchall():
            d = dict(r)
            d["extracted_topics"] = json.loads(d["extracted_topics"]) if d.get("extracted_topics") else []
            docs.append(d)
        return docs

@router.get("/{doc_id}")
async def get_document_detail(doc_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ? AND user_id = ?", (doc_id, current_user["id"]))
        doc_row = cursor.fetchone()
        if not doc_row:
            raise HTTPException(status_code=404, detail="Document not found")
        doc = dict(doc_row)
        doc["extracted_topics"] = json.loads(doc["extracted_topics"]) if doc.get("extracted_topics") else []
        
        cursor.execute("SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index ASC", (doc_id,))
        doc["chunks"] = [dict(r) for r in cursor.fetchall()]
        return doc

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM documents WHERE id = ? AND user_id = ?", (doc_id, current_user["id"]))
    return {"status": "success", "message": "Document deleted successfully"}
