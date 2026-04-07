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


# ── Batch models ────────────────────────────────────────────────

class BatchResponse(BaseModel):
    batch_id: str
    job_ids: list[str]
    status: str
    message: str


class BatchJobStatus(BaseModel):
    job_id: str
    status: JobStatus
    report: Optional[dict] = None
    error: Optional[str] = None


class BatchStatusResponse(BaseModel):
    batch_id: str
    status: str  # processing | complete | partial
    total: int
    completed: int
    jobs: list[BatchJobStatus]


# ── Comparison models ───────────────────────────────────────────

class ComparisonRequest(BaseModel):
    report_a: dict
    report_b: dict
    jd_text: str


class ComparisonCategory(BaseModel):
    category: str
    candidate_a_score: int
    candidate_b_score: int
    edge: str
    reasoning: str


class ComparisonReport(BaseModel):
    candidate_a_name: str
    candidate_b_name: str
    winner: str
    confidence: str
    summary: str
    categories: list[ComparisonCategory]
    candidate_a_strengths: list[str]
    candidate_b_strengths: list[str]
    recommendation: str