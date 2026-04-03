from typing import List, Dict
from .gemini_client import GeminiClient
from .database import SessionLocal
from .models import Candidate, Job


class ScoringEngine:
    def __init__(self):
        self.gemini = GeminiClient()
    
    def score_candidates_for_job(self, job_id: str):
        """Score all pending candidates for a job"""

        db = SessionLocal()  # ✅ create fresh DB session

        try:
            # ------------------- GET JOB -------------------
            job = db.query(Job).filter(Job.id == job_id).first()
            if not job:
                return
            
            # ------------------- GET CANDIDATES -------------------
            candidates = db.query(Candidate).filter(
                Candidate.job_id == job_id,
                Candidate.status == "pending"
            ).all()
            
            if not candidates:
                return
            
            # ------------------- PREPARE BATCH -------------------
            resume_batch = [
                {
                    "candidate_id": str(cand.id),
                    "text": cand.anonymized_text
                }
                for cand in candidates
            ]
            
            # ------------------- BATCH SCORING -------------------
            batch_size = 10
            all_scores = []
            
            for i in range(0, len(resume_batch), batch_size):
                batch = resume_batch[i:i+batch_size]
                
                scores = self.gemini.batch_score(
                    batch,
                    job.jd_text,
                    job.weights
                )
                
                all_scores.extend(scores)
            
            # ------------------- UPDATE DB -------------------
            for score_data in all_scores:
                candidate = db.query(Candidate).filter(
                    Candidate.id == score_data["candidate_id"]
                ).first()
                
                if candidate:
                    candidate.score = score_data.get("score")
                    candidate.reasoning = score_data.get("reasoning")
                    candidate.confidence = score_data.get("confidence")
                    candidate.status = "scored"
            
            db.commit()

        except Exception as e:
            print("❌ Scoring error:", str(e))
        
        finally:
            db.close()  # ✅ always close