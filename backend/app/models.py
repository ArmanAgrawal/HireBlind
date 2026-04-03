from sqlalchemy import Column, String, Float, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from .database import Base
import uuid

# ------------------- JOB -------------------

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    jd_text = Column(Text, nullable=False)
    weights = Column(JSON, nullable=False)
    bias_flags = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ------------------- CANDIDATE -------------------

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, ForeignKey("jobs.id", ondelete="CASCADE"))
    original_filename = Column(String(255))
    anonymized_text = Column(Text, nullable=False)
    score = Column(Float)
    reasoning = Column(JSON)
    confidence = Column(Float)
    status = Column(String(50), default="pending")
    llm_error = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ------------------- AUDIT REDACTIONS -------------------

class AuditRedaction(Base):
    __tablename__ = "audit_redactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"))
    original_pii = Column(Text, nullable=False)
    redacted_token = Column(Text, nullable=False)
    entity_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ------------------- DECISIONS -------------------

class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidates.id", ondelete="CASCADE"))
    decision = Column(Enum("shortlist", "reject", name="decision_type"))
    override_reason = Column(Text)
    revealed_at = Column(DateTime(timezone=True))
    decided_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())