# backend/main.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile

from models.schemas import JobResponse, StatusResponse, JobStatus
from ingestion.loader import load_documents
from crew.pipeline import screen_candidate
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SkillGuard AI",
    description="AI-native hiring intelligence platform",
    version="1.0.0"
)

# CORS — allows the React frontend (running on localhost:5173)
# to make requests to this backend (running on localhost:8000)
# Without this, browsers block cross-origin requests entirely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store — maps job_id → {status, report, error}
# In production this would be Redis, but for our purposes this is fine
# It resets when the server restarts, which is acceptable for a portfolio project
jobs: dict = {}


def run_screening_job(job_id: str, resume_path: str, jd_path: str):
    try:
        jobs[job_id]["status"] = JobStatus.running

        # Load separately — no filename guessing needed
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
    """
    Accepts resume + JD as file uploads.
    Saves them to temp files, kicks off background job, returns job_id immediately.
    
    Why UploadFile instead of JSON? Because we're receiving binary PDF data,
    not text. FastAPI handles multipart/form-data file uploads natively.
    """
    job_id = str(uuid.uuid4())[:8]  # short ID like "a3f7b2c1"

    # Save uploaded files to temp directory
    # We can't pass file objects to background threads, so we save to disk first
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_resume:
        tmp_resume.write(await resume.read())
        resume_path = tmp_resume.name

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_jd:
        tmp_jd.write(await jd.read())
        jd_path = tmp_jd.name

    # Initialize job in the store
    jobs[job_id] = {
        "status": JobStatus.pending,
        "report": None,
        "error": None
    }

    # Add to background tasks — runs after this function returns
    background_tasks.add_task(run_screening_job, job_id, resume_path, jd_path)

    return JobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        message=f"Screening started. Poll /status/{job_id} for results."
    )


@app.get("/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str):
    """
    Frontend polls this every 2 seconds.
    Returns current status + report when complete.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    job = jobs[job_id]
    return StatusResponse(
        job_id=job_id,
        status=job["status"],
        report=job.get("report"),
        error=job.get("error")
    )


@app.get("/health")
def health():
    return {"status": "ok", "active_jobs": len(jobs)}


# ── Serve React frontend ────────────────────────────────────────────────────
# This must come LAST — the catch-all route {full_path:path} would intercept
# /screen, /status etc. if placed before them

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))