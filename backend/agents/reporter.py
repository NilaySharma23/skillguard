import os
import json
from agents.llm_client import generate_with_fallback as generate, parse_json_response

def generate_report(audited_claims: dict, jd_text: str) -> dict:
    prompt = f"""You are generating a hiring intelligence report for a hiring manager.

Job Description:
{jd_text}

Candidate Data:
{json.dumps(audited_claims, indent=2)}

Generate a comprehensive hiring report. Return ONLY valid JSON:
{{
  "candidate_name": "string",
  "match_score": 0,
  "match_reasoning": "string",
  "verified_strengths": ["strength1"],
  "risk_flags": ["risk1"],
  "recommended_interview_questions": [
    {{
      "question": "string",
      "targets": "what this question is trying to verify"
    }}
  ],
  "hiring_recommendation": "strong_yes | yes | maybe | no",
  "summary": "2-3 sentence executive summary for hiring manager"
}}

match_score is 0-100 based on JD fit + credibility.
Generate 5 interview questions targeting the weakest/unverified claims."""

    text = generate(prompt)
    try:
        return parse_json_response(text)
    except Exception:
        return {"error": "Report generation failed", "raw": text}