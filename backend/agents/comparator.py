# backend/agents/comparator.py

import json
from agents.llm_client import generate_with_fallback as generate, parse_json_response


def compare_candidates(report_a: dict, report_b: dict, jd_text: str) -> dict:
    """
    Agent 5 — Comparator.
    Takes two completed screening reports + the JD and generates
    a structured side-by-side comparison with an AI verdict.
    """
    prompt = f"""You are a senior hiring manager comparing two candidates for the same role.

Job Description:
{jd_text}

Candidate A Report:
{json.dumps(report_a, indent=2)}

Candidate B Report:
{json.dumps(report_b, indent=2)}

Generate a structured comparison. Return ONLY valid JSON:
{{
  "candidate_a_name": "string",
  "candidate_b_name": "string",
  "winner": "Candidate A name or Candidate B name",
  "confidence": "high/medium/low",
  "summary": "2-3 sentence overall verdict comparing both candidates for this specific role",
  "categories": [
    {{
      "category": "string (e.g. Technical Skills, Project Experience, etc.)",
      "candidate_a_score": 0-10,
      "candidate_b_score": 0-10,
      "edge": "A or B or Tie",
      "reasoning": "one sentence explaining the score difference"
    }}
  ],
  "candidate_a_strengths": ["relative strengths vs candidate B"],
  "candidate_b_strengths": ["relative strengths vs candidate A"],
  "recommendation": "Final hiring advice for this specific JD — who to hire and why"
}}

Include 4-6 categories such as: Technical Skills, Project Quality, Experience Relevance, Verification Credibility, Cultural Fit Indicators, Growth Potential.
Base scores on verified evidence, not just claims. Penalize unverified or suspicious claims."""

    text = generate(prompt)
    try:
        return parse_json_response(text)
    except Exception:
        return {"error": "Comparison generation failed", "raw": text}
