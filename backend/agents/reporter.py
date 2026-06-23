import os
import json
from agents.llm_client import generate_with_fallback as generate, parse_json_response

def generate_report(audited_claims: dict, jd_text: str) -> dict:
    prompt = f"""You are a senior hiring manager generating a hiring intelligence report.
You don't just check whether resume claims are true — you assess whether this person
can actually do the job: how they think, how fast they solve problems, and how well
they adapt to new environments.

Job Description:
{jd_text}

Candidate Data (parsed claims + verification evidence + audit):
{json.dumps(audited_claims, indent=2)}

Generate a comprehensive hiring report. Return ONLY valid JSON in exactly this shape:
{{
  "candidate_name": "string",
  "match_score": 0,
  "match_reasoning": "string — explain the score, referencing JD fit, claim credibility, AND work-experience relevance",
  "verified_strengths": ["claims backed by real evidence"],
  "risk_flags": ["suspicious, exaggerated, or unverifiable claims"],
  "experience_assessment": {{
    "score": 0,
    "environments": ["each DISTINCT environment worked in, e.g. 'Early-stage Indian startup', 'Seed-funded US company', 'Founder of own venture'"],
    "adaptability": "one sentence on adaptability and breadth, inferred from environment diversity, tenure, and role progression",
    "reasoning": "2-3 sentences justifying the experience score"
  }},
  "education": {{
    "summary": "degree, institution, year — or 'Not specified on resume'",
    "relevance": "how it maps to this role; note degree is good-to-have, not mandatory, unless the JD explicitly requires it"
  }},
  "recommended_interview_questions": [
    {{
      "question": "string",
      "category": "claim_verification | problem_solving | critical_thinking | adaptability | domain_knowledge | education",
      "targets": "what this question assesses"
    }}
  ],
  "hiring_recommendation": "strong_yes | yes | maybe | no",
  "summary": "2-3 sentence executive summary for the hiring manager"
}}

SCORING — match_score (0-100) weighs THREE things, not just claim truth:
1. JD fit — how well skills/projects map to what the role needs.
2. Claim credibility — use the verification evidence and audit; penalize unverified or suspicious claims.
3. Experience relevance & adaptability — reward candidates who have worked across DIFFERENT
   environments (e.g. startup + enterprise + founder), shown progression, or demonstrated
   they can adapt quickly. Working in 3 different company types is a strong adaptability signal.
Do NOT penalize a non-technical or light-GitHub candidate purely for missing code evidence —
weigh their actual experience and claim specificity instead.

experience_assessment.score (0-100) rates work history on its own: environment diversity,
tenure, seniority progression, and breadth of contexts. Use 'company_context' and 'location'
from each experience entry to identify distinct environments.

INTERVIEW QUESTIONS — generate 7-8 questions with a DELIBERATE MIX of categories. A good
hiring manager tests more than recalled facts. Include roughly:
- 2 "claim_verification" — probe the weakest / unverified claims.
- 2 "problem_solving" — pose a concrete, realistic problem from the role's domain and ask how
  they'd approach it. Tests reasoning and speed, not memorization.
- 1 "critical_thinking" — an open-ended or slightly out-of-domain question that tests how they
  reason under ambiguity (this is intentionally NOT tied to a resume claim).
- 1 "adaptability" — probe how they handle new environments, tools, or unfamiliar problems;
  tie it to the variety (or lack) in their work history.
- 1 "domain_knowledge" — depth in their core area.
- 1 "education" — ONLY if it adds value (e.g. fundamentals tied to the degree, or a gap worth
  probing). If education is irrelevant to the role, replace it with another problem_solving
  question instead of forcing a degree question."""

    text = generate(prompt)
    try:
        return parse_json_response(text)
    except Exception:
        return {"error": "Report generation failed", "raw": text}