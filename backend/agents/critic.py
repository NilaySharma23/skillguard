import os
import json
from agents.llm_client import generate_with_fallback as generate, parse_json_response

def audit_claims(verified_claims: dict) -> dict:
    verification_results = verified_claims.get("verification_results", [])
    scores = [r.get("confidence_score", 0.5) for r in verification_results]
    avg_confidence = sum(scores) / len(scores) if scores else 0.5

    prompt = f"""You are a critical evaluator auditing a resume verification report.

Candidate: {verified_claims.get('candidate_name', 'Unknown')}
Skills claimed: {verified_claims.get('skills', [])}
Verification results: {json.dumps(verification_results, indent=2)}

Your tasks:
1. Identify any hallucinations or over-claiming (vague buzzwords, impossible claims)
2. Check for potential bias in the evaluation
3. Give an overall credibility assessment

Return ONLY valid JSON:
{{
  "hallucination_flags": ["description of suspicious claim"],
  "bias_flags": ["any potential bias detected"],
  "credibility_score": 0.0,
  "overall_assessment": "one paragraph summary",
  "needs_reverification": false
}}

Set needs_reverification to true if confidence is genuinely low and more checking would help."""

    text = generate(prompt)
    try:
        audit = parse_json_response(text)
    except Exception:
        audit = {
            "hallucination_flags": [],
            "bias_flags": [],
            "credibility_score": avg_confidence,
            "overall_assessment": "Audit parsing failed",
            "needs_reverification": avg_confidence < 0.5
        }

    verified_claims["audit"] = audit
    verified_claims["avg_confidence"] = avg_confidence
    return verified_claims