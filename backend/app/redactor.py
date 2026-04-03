import spacy
import re
from typing import Dict, List, Tuple
from uuid import uuid4



try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

    
class PIIRedactor:
    def __init__(self):
        self.pii_counter = {}
        
    def redact_text(self, text: str, candidate_id: str) -> Tuple[str, List[Dict]]:
        """
        Redact PII from text and return audit log entries
        """
        doc = nlp(text)
        redacted_text = text
        audit_entries = []
        
        # Patterns for additional PII
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        
        # Redact emails
        for match in re.finditer(email_pattern, redacted_text):
            original = match.group()
            token = f"[EMAIL_{uuid4().hex[:8]}]"
            redacted_text = redacted_text.replace(original, token)
            audit_entries.append({
                "candidate_id": candidate_id,
                "original_pii": original,
                "redacted_token": token,
                "entity_type": "EMAIL"
            })
        
        # Redact phone numbers
        for match in re.finditer(phone_pattern, redacted_text):
            original = match.group()
            token = f"[PHONE_{uuid4().hex[:8]}]"
            redacted_text = redacted_text.replace(original, token)
            audit_entries.append({
                "candidate_id": candidate_id,
                "original_pii": original,
                "redacted_token": token,
                "entity_type": "PHONE"
            })
        
        # Redact named entities
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "LOC"]:
                original = ent.text
                entity_map = {
                    "PERSON": "CANDIDATE_NAME",
                    "ORG": "ORGANIZATION",
                    "GPE": "LOCATION",
                    "LOC": "LOCATION"
                }
                token = f"[{entity_map.get(ent.label_, 'REDACTED')}_{uuid4().hex[:8]}]"
                redacted_text = redacted_text.replace(original, token)
                audit_entries.append({
                    "candidate_id": candidate_id,
                    "original_pii": original,
                    "redacted_token": token,
                    "entity_type": ent.label_
                })
        
        return redacted_text, audit_entries
    
    def check_bias(self, text: str) -> Dict:
        """Check for biased language in job description"""
        gendered_words = [
            "rockstar", "ninja", "guru", "dominate", "competitive",
            "aggressive", "manpower", "gentleman", "salesman"
        ]
        
        age_biased_words = [
            "young", "recent graduate", "digital native", "energetic",
            "years of experience", "fresh", "junior", "senior"
        ]
        
        found_gendered = [word for word in gendered_words if word.lower() in text.lower()]
        found_age = [word for word in age_biased_words if word.lower() in text.lower()]
        
        return {
            "gendered": found_gendered,
            "age_biased": found_age,
            "has_bias": len(found_gendered) > 0 or len(found_age) > 0
        }