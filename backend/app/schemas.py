from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime


# ------------------- JOB -------------------

class JobCreate(BaseModel):
    title: str
    jd_text: str
    weights: Dict[str, float]


class JobResponse(BaseModel):
    id: str
    title: str
    jd_text: str
    weights: Dict[str, float]
    bias_flags: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        orm_mode = True


# ------------------- CANDIDATE -------------------

class CandidateUpload(BaseModel):
    job_id: str


class CandidateResponse(BaseModel):
    id: str
    job_id: str
    score: Optional[float]
    reasoning: Optional[Any]   # ✅ flexible JSON
    confidence: Optional[float]
    status: str

    class Config:
        orm_mode = True


# ------------------- DECISION -------------------

class DecisionCreate(BaseModel):
    candidate_id: str
    decision: str
    override_reason: Optional[str] = None
    decided_by: str


# ------------------- SCORE -------------------

class ScoreResponse(BaseModel):
    score: float
    reasoning: List[str]
    confidence_index: float