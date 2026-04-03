from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Enum, Boolean,ForeignKey
from sqlalchemy.sql import func
import uuid
import enum
from .database import Base

# Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)  # Store hashed passwords
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.RECRUITER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    jd_text = Column(Text, nullable=False)
    weights = Column(JSON, nullable=False)
    bias_flags = Column(JSON)
    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Candidate(Base):
    __tablename__ = "candidates"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("jobs.id", ondelete="CASCADE"))
    original_filename = Column(String(255))
    anonymized_text = Column(Text, nullable=False)
    score = Column(Float)
    reasoning = Column(JSON)
    confidence = Column(Float)
    status = Column(String(50), default="pending")
    llm_error = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditRedaction(Base):
    __tablename__ = "audit_redactions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"))
    original_pii = Column(Text, nullable=False)
    redacted_token = Column(Text, nullable=False)
    entity_type = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"))
    decision = Column(String(20))
    override_reason = Column(Text)
    revealed_at = Column(DateTime(timezone=True))
    decided_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())