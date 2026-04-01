import os
from agents.llm_client import generate_with_fallback as generate, parse_json_response

def parse_claims(resume_text: str) -> dict:
    prompt = f"""You are a senior technical recruiter parsing a resume.
Extract ALL verifiable claims from this resume into structured JSON.

Resume text:
{resume_text}

Return ONLY valid JSON in exactly this format, nothing else:
{{
  "candidate_name": "string",
  "skills": ["skill1", "skill2"],
  "experience": [
    {{
      "company": "string",
      "role": "string",
      "duration": "string",
      "claims": ["specific achievement or responsibility"]
    }}
  ],
  "projects": [
    {{
      "name": "string",
      "tech_stack": ["tech1", "tech2"],
      "claims": ["specific claim about this project"]
    }}
  ],
  "education": {{
    "degree": "string",
    "institution": "string",
    "year": "string"
  }}
}}"""

    text = generate(prompt)
    return parse_json_response(text)