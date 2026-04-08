# backend/main.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import asyncio
from typing import List
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile

from models.schemas import (
    JobResponse, StatusResponse, JobStatus,
    BatchResponse, BatchStatusResponse, BatchJobStatus,
    ComparisonRequest,
)
from ingestion.loader import load_documents
from crew.pipeline import screen_candidate
from agents.comparator import compare_candidates
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SkillGuard AI",
    description="AI-native hiring intelligence platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores
jobs: dict = {}
batches: dict = {}


# ── Single candidate ────────────────────────────────────────────────────────

def run_screening_job(job_id: str, resume_path: str, jd_path: str):
    try:
        jobs[job_id]["status"] = JobStatus.running

        resume_docs = load_documents([resume_path])
        jd_docs = load_documents([jd_path])

        resume_text = " ".join(doc.text for doc in resume_docs)
        jd_text = " ".join(doc.text for doc in jd_docs)

        if not resume_text.strip() or not jd_text.strip():
            raise ValueError("Could not extract text from uploaded files")

        report = screen_candidate(resume_text, jd_text)

        jobs[job_id]["status"] = JobStatus.complete
        jobs[job_id]["report"] = report
        print(f"Job {job_id} completed successfully")

    except Exception as e:
        jobs[job_id]["status"] = JobStatus.failed
        jobs[job_id]["error"] = str(e)
        print(f"Job {job_id} failed: {e}")

    finally:
        for path in [resume_path, jd_path]:
            if os.path.exists(path):
                os.remove(path)


@app.post("/screen", response_model=JobResponse)
async def screen_resume(
    background_tasks: BackgroundTasks,
    resume: UploadFile = File(...),
    jd: UploadFile = File(...),
):
    job_id = str(uuid.uuid4())[:8]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_resume:
        tmp_resume.write(await resume.read())
        resume_path = tmp_resume.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_jd:
        tmp_jd.write(await jd.read())
        jd_path = tmp_jd.name

    jobs[job_id] = {
        "status": JobStatus.pending,
        "report": None,
        "error": None
    }

    background_tasks.add_task(run_screening_job, job_id, resume_path, jd_path)

    return JobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        message=f"Screening started. Poll /status/{job_id} for results."
    )


@app.get("/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = jobs[job_id]
    return StatusResponse(
        job_id=job_id,
        status=job["status"],
        report=job.get("report"),
        error=job.get("error")
    )


# ── Batch screening ────────────────────────────────────────────────────────

def run_batch_job(job_id: str, resume_path: str, jd_text: str):
    """Like run_screening_job but receives pre-extracted JD text."""
    try:
        jobs[job_id]["status"] = JobStatus.running

        resume_docs = load_documents([resume_path])
        resume_text = " ".join(doc.text for doc in resume_docs)

        if not resume_text.strip():
            raise ValueError("Could not extract text from resume")

        report = screen_candidate(resume_text, jd_text)

        jobs[job_id]["status"] = JobStatus.complete
        jobs[job_id]["report"] = report
        print(f"Batch job {job_id} completed successfully")

    except Exception as e:
        jobs[job_id]["status"] = JobStatus.failed
        jobs[job_id]["error"] = str(e)
        print(f"Batch job {job_id} failed: {e}")

    finally:
        if os.path.exists(resume_path):
            os.remove(resume_path)


@app.post("/screen-batch", response_model=BatchResponse)
async def screen_batch(
    background_tasks: BackgroundTasks,
    jd: UploadFile = File(...),
    resumes: List[UploadFile] = File(...),
):
    """
    Accepts 1 JD + up to 3 resumes.
    Creates independent jobs for each resume, all sharing the same JD.
    """
    if len(resumes) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 resumes per batch")

    if len(resumes) < 1:
        raise HTTPException(status_code=400, detail="At least 1 resume required")

    # Read JD once and share across all jobs
    jd_docs = load_documents_from_bytes(await jd.read(), ".pdf")
    jd_text = " ".join(doc.text for doc in jd_docs)

    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from JD")

    batch_id = str(uuid.uuid4())[:8]
    job_ids = []

    for resume_file in resumes:
        job_id = str(uuid.uuid4())[:8]

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await resume_file.read())
            resume_path = tmp.name

        jobs[job_id] = {
            "status": JobStatus.pending,
            "report": None,
            "error": None,
        }
        job_ids.append(job_id)

        background_tasks.add_task(run_batch_job, job_id, resume_path, jd_text)

    batches[batch_id] = {
        "job_ids": job_ids,
        "jd_text": jd_text,
    }

    return BatchResponse(
        batch_id=batch_id,
        job_ids=job_ids,
        status="processing",
        message=f"Batch started with {len(resumes)} resume(s). Poll /batch/{batch_id} for results."
    )


@app.get("/batch/{batch_id}", response_model=BatchStatusResponse)
def get_batch_status(batch_id: str):
    if batch_id not in batches:
        raise HTTPException(status_code=404, detail=f"Batch {batch_id} not found")

    batch = batches[batch_id]
    job_statuses = []
    completed = 0
    any_failed = False

    for jid in batch["job_ids"]:
        job = jobs.get(jid, {"status": JobStatus.pending, "report": None, "error": None})
        if job["status"] == JobStatus.complete:
            completed += 1
        if job["status"] == JobStatus.failed:
            any_failed = True
        job_statuses.append(BatchJobStatus(
            job_id=jid,
            status=job["status"],
            report=job.get("report"),
            error=job.get("error"),
        ))

    total = len(batch["job_ids"])
    if completed == total:
        overall = "complete"
    elif completed > 0 and any_failed:
        overall = "partial"
    else:
        overall = "processing"

    return BatchStatusResponse(
        batch_id=batch_id,
        status=overall,
        total=total,
        completed=completed,
        jobs=job_statuses,
    )


# ── Comparison ──────────────────────────────────────────────────────────────

@app.post("/compare")
def compare(req: ComparisonRequest):
    """Runs Agent 5 (Comparator) on two completed reports."""
    result = compare_candidates(req.report_a, req.report_b, req.jd_text)
    return result


# ── Utilities ───────────────────────────────────────────────────────────────

def load_documents_from_bytes(file_bytes: bytes, suffix: str):
    """Helper to load documents from raw bytes via a temp file."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name
    try:
        return load_documents([tmp_path])
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get("/health")
def health():
    return {"status": "ok", "active_jobs": len(jobs), "active_batches": len(batches)}


# ── Serve React frontend ────────────────────────────────────────────────────

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))