from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import fitz  # ✅ correct import
import uuid

from .database import engine, get_db, Base
from .models import Job, Candidate, AuditRedaction, Decision
from .schemas import JobCreate, JobResponse, CandidateResponse, DecisionCreate
from .redactor import PIIRedactor
from .scoring import ScoringEngine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bias-Free Recruitment API")


# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redactor = PIIRedactor()
scoring_engine = ScoringEngine()


# ------------------- JOB -------------------

@app.post("/api/jobs", response_model=JobResponse)
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    """Create a new job"""
    bias_flags = redactor.check_bias(job.jd_text)

    db_job = Job(
        title=job.title,
        jd_text=job.jd_text,
        weights=job.weights,
        bias_flags=bias_flags
    )

    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    return db_job


# ------------------- UPLOAD -------------------

@app.post("/api/jobs/{job_id}/upload")
async def upload_resumes(
    job_id: str,
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Upload and process resumes"""

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    processed = []

    for file in files:
        try:
            content = await file.read()

            # ✅ FIXED: use fitz
            pdf_document = fitz.open(stream=content, filetype="pdf")

            text = ""
            for page in pdf_document:
                text += page.get_text()

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

        # Redact PII
        candidate_id = str(uuid.uuid4())
        redacted_text, audit_entries = redactor.redact_text(text, candidate_id)

        candidate = Candidate(
            id=candidate_id,
            job_id=job_id,
            original_filename=file.filename,
            anonymized_text=redacted_text,
            status="pending"
        )

        db.add(candidate)

        # Save audit logs
        for entry in audit_entries:
            db.add(AuditRedaction(**entry))

        processed.append(candidate)

    db.commit()

    # ✅ safer background task (no DB session passed)
    if background_tasks:
        background_tasks.add_task(scoring_engine.score_candidates_for_job, job_id)

    return {
        "message": f"Processed {len(processed)} resumes",
        "count": len(processed)
    }


# ------------------- GET CANDIDATES -------------------

@app.get("/api/jobs/{job_id}/candidates", response_model=List[CandidateResponse])
def get_candidates(job_id: str, db: Session = Depends(get_db)):
    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
    return candidates


# ------------------- DECISION -------------------

@app.post("/api/decisions")
def make_decision(decision: DecisionCreate, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == decision.candidate_id).first()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Get top candidate
    top_candidate = db.query(Candidate).filter(
        Candidate.job_id == candidate.job_id
    ).order_by(Candidate.score.desc()).first()

    is_top = top_candidate and (top_candidate.id == candidate.id)

    # Enforce reason
    if decision.decision == "reject" and is_top and not decision.override_reason:
        raise HTTPException(status_code=400, detail="Reason required to reject top candidate")

    db_decision = Decision(
        candidate_id=decision.candidate_id,
        decision=decision.decision,
        override_reason=decision.override_reason if is_top else None,
        decided_by=decision.decided_by
    )

    db.add(db_decision)
    db.commit()

    return {"message": "Decision recorded"}


# ------------------- REVEAL -------------------

@app.post("/api/candidates/{candidate_id}/reveal")
def reveal_candidate(candidate_id: str, db: Session = Depends(get_db)):

    decision = db.query(Decision).filter(Decision.candidate_id == candidate_id).first()

    if not decision:
        raise HTTPException(status_code=400, detail="Make decision first")

    audits = db.query(AuditRedaction).filter(
        AuditRedaction.candidate_id == candidate_id
    ).all()

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    pii_map = {a.redacted_token: a.original_pii for a in audits}

    return {
        "filename": candidate.original_filename,
        "pii_map": pii_map
    }


# ------------------- AUDIT -------------------

@app.get("/api/jobs/{job_id}/audit")
def get_audit(job_id: str, db: Session = Depends(get_db)):

    candidates = db.query(Candidate).filter(Candidate.job_id == job_id).all()
    result = []

    for candidate in candidates:
        audits = db.query(AuditRedaction).filter(
            AuditRedaction.candidate_id == candidate.id
        ).all()

        decision = db.query(Decision).filter(
            Decision.candidate_id == candidate.id
        ).first()

        result.append({
            "candidate_id": str(candidate.id),
            "redactions": [
                {"type": a.entity_type, "value": a.redacted_token}
                for a in audits
            ],
            "decision": decision.decision if decision else None,
            "override_reason": decision.override_reason if decision else None
        })

    return result


# Add this new endpoint to get all jobs

@app.get("/api/jobs")
def get_all_jobs(db: Session = Depends(get_db)):
    """Get all jobs"""
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return jobs

# ------------------- HEALTH -------------------

@app.get("/api/health")
def health():
    return {"status": "ok"}