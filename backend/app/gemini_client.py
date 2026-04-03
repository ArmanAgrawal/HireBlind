import os
import json
from typing import Dict, List
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class GeminiClient:   # keep same name (no need to change rest of code)
    def __init__(self):
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.model = "llama-3.1-8b-instant"   # 🔥 best model

    def score_resume(self, anonymized_resume: str, job_description: str, weights: Dict) -> Dict:
        prompt = f"""
You are an unbiased AI recruiter. Analyze the resume against the job description.

Job Description:
{job_description}

Resume (PII removed):
{anonymized_resume}

Weights:
{json.dumps(weights)}

STRICTLY return ONLY JSON:
{{
  "score": 0-100,
  "reasoning": ["points"],
  "confidence_index": 0.0-1.0
}}
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )

            text = response.choices[0].message.content.strip()

            # Clean markdown if present
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            result = json.loads(text)

            return result

        except Exception as e:
            print("Groq error:", e)
            return {
                "score": 50,
                "reasoning": ["Fallback due to error", str(e)],
                "confidence_index": 0.5
            }

    def batch_score(self, resumes: List[Dict], job_description: str, weights: Dict) -> List[Dict]:
        results = []

        for resume in resumes:
            score = self.score_resume(
                resume["text"],
                job_description,
                weights
            )

            results.append({
                "candidate_id": resume["candidate_id"],
                "score": score.get("score"),
                "reasoning": score.get("reasoning"),
                "confidence": score.get("confidence_index")
            })

        return results