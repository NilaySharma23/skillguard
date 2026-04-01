# backend/models/schemas.py

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    complete = "complete"
    failed = "failed"


class ScreeningRequest(BaseModel):
    """
    Pydantic validates incoming request data automatically.
    If candidate_name is missing or files aren't uploaded,
    FastAPI returns a 422 error before your code even runs.
    """
    candidate_name: Optional[str] = None


class InterviewQuestion(BaseModel):
    question: str
    targets: str


class ScreeningReport(BaseModel):
    candidate_name: str
    match_score: int
    match_reasoning: str
    verified_strengths: list[str]
    risk_flags: list[str]
    recommended_interview_questions: list[InterviewQuestion]
    hiring_recommendation: str
    summary: str


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str


class StatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    report: Optional[dict] = None
    error: Optional[str] = None