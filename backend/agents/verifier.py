import os
from agents.llm_client import generate_with_fallback as generate, parse_json_response
from ddgs import DDGS

def search_web(query: str, max_results: int = 3) -> list:
    results = []
    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r.get("title", ""),
                "snippet": r.get("body", ""),
                "url": r.get("href", ""),
            })
    return results


def verify_claims(parsed_claims: dict) -> dict:
    verified = parsed_claims.copy()
    verified["verification_results"] = []

    for project in parsed_claims.get("projects", []):
        project_name = project.get("name", "")
        tech_stack = ", ".join(project.get("tech_stack", []))
        candidate = parsed_claims.get("candidate_name", "")

        query = f"{candidate} {project_name} {tech_stack} project GitHub"
        evidence = search_web(query, max_results=3)

        evidence_text = "\n".join([
            f"- {e['title']}: {e['snippet']}" for e in evidence
        ])

        prompt = f"""You are verifying a resume claim.

Candidate: {candidate}
Project claimed: {project_name}
Tech stack claimed: {tech_stack}

Web search evidence found:
{evidence_text if evidence_text else "No evidence found online."}

Rate this claim:
- confidence_score: 0.0 (completely unverifiable) to 1.0 (strongly verified)
- status: "verified", "unverified", or "suspicious"
- reasoning: one sentence explanation

Return ONLY valid JSON with no extra text:
{{
  "confidence_score": <float between 0.0 and 1.0>,
  "status": <"verified", "unverified", or "suspicious">,
  "reasoning": <one sentence string>
}}"""

        text = generate(prompt)
        try:
            result = parse_json_response(text)
        except Exception:
            result = {"confidence_score": 0.5, "status": "unverified", "reasoning": "Parse error"}

        verified["verification_results"].append({
            "type": "project",
            "name": project_name,
            "evidence": evidence,
            **result
        })

    return verified