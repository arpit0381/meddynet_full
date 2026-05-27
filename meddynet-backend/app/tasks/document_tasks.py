"""
Document AI Processing Tasks
─────────────────────────────
Background processing for uploaded vault documents.
Extracts metadata (doctor name, test date, lab name) from
uploaded documents using pattern matching and OCR-ready hooks.
"""
import asyncio
import logging
import re
from datetime import datetime, timezone
from app.celery_app import celery_app
from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)


async def async_extract_metadata(document_id: str, filename: str, content_type: str):
    """
    Extracts structured metadata from an uploaded health document.
    
    In production, this would integrate with:
    - Google Cloud Vision / Document AI for OCR
    - Gemini for structured data extraction
    
    For now, it uses filename-based heuristics and logs the event.
    """
    logger.info(f"[DocumentAI] Processing document {document_id}: {filename}")
    
    metadata = {
        "document_id": document_id,
        "filename": filename,
        "content_type": content_type,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "extracted": {}
    }
    
    name_lower = filename.lower()
    
    # ── Category Detection ──
    if any(kw in name_lower for kw in ["prescription", "rx", "presc"]):
        metadata["extracted"]["category"] = "Prescription"
    elif any(kw in name_lower for kw in ["scan", "xray", "x-ray", "mri", "ct", "ultrasound", "usg"]):
        metadata["extracted"]["category"] = "Scan"
    elif any(kw in name_lower for kw in ["report", "lab", "test", "blood", "cbc", "thyroid", "lipid"]):
        metadata["extracted"]["category"] = "Lab Report"
    else:
        metadata["extracted"]["category"] = "Other"
    
    # ── Date Extraction from Filename ──
    date_patterns = [
        r'(\d{4}[-_]\d{2}[-_]\d{2})',           # 2024-03-15
        r'(\d{2}[-_]\d{2}[-_]\d{4})',           # 15-03-2024
        r'(\d{2}[-_]\w{3}[-_]\d{4})',           # 15-Mar-2024
    ]
    for pattern in date_patterns:
        match = re.search(pattern, filename)
        if match:
            metadata["extracted"]["date_from_filename"] = match.group(1)
            break
    
    # ── Lab Name Extraction ──
    known_labs = [
        "thyrocare", "dr lal", "lal path", "srl", "metropolis",
        "apollo", "max", "fortis", "medanta", "narayana",
        "healthians", "redcliffe", "orange health"
    ]
    for lab in known_labs:
        if lab in name_lower:
            metadata["extracted"]["lab_name"] = lab.title()
            break
    
    # ── Test Name Extraction ──
    known_tests = [
        "cbc", "thyroid", "lipid", "liver function", "kidney function",
        "hba1c", "vitamin d", "vitamin b12", "blood sugar", "urine",
        "creatinine", "hemoglobin", "platelet", "wbc", "rbc"
    ]
    detected_tests = [t.upper() for t in known_tests if t in name_lower]
    if detected_tests:
        metadata["extracted"]["tests_detected"] = detected_tests
    
    # ── Log to MongoDB Analytics ──
    await analytics_service.log_event(
        level="info",
        event="document_ai_processed",
        message=f"Extracted metadata for {filename}",
        context=metadata
    )
    
    logger.info(f"[DocumentAI] Completed: {metadata['extracted']}")
    return metadata


@celery_app.task
def process_uploaded_document(document_id: str, filename: str, content_type: str = "application/pdf"):
    """
    Celery task to process an uploaded document in the background.
    Called when a user uploads a file to the Safe Vault.
    """
    logger.info(f"[DocumentAI] Background task started for document: {document_id}")
    result = asyncio.run(async_extract_metadata(document_id, filename, content_type))
    return {"status": "processed", "metadata": result}
