# backend/agents/verifier.py

import os
import requests
from agents.llm_client import generate_with_fallback as generate, parse_json_response
from ddgs import DDGS


def search_web(query: str, max_results: int = 3) -> list:
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    "title": r.get("title", ""),
                    "snippet": r.get("body", ""),
                    "url": r.get("href", ""),
                })
    except Exception as e:
        print(f"  Web search failed: {e}")
    return results


def get_github_headers() -> dict:
    token = os.getenv("GITHUB_TOKEN")
    if token:
        return {"Authorization": f"token {token}"}
    return {}


def find_matching_repo(username: str, project_name: str) -> dict | None:
    """
    Step 1: Get all repos for the user.
    Step 2: Ask LLM which repo matches the claimed project.
    Step 3: Return that repo's details.
    """
    try:
        # Fetch all public repos
        url = f"https://api.github.com/users/{username}/repos?per_page=100"
        response = requests.get(url, headers=get_github_headers())

        if response.status_code != 200:
            print(f"  GitHub API error: {response.status_code}")
            return None

        repos = response.json()
        if not repos:
            return None

        # Build a simple list for the LLM to reason over
        repo_list = [
            {"name": r["name"], "description": r.get("description", "") or ""}
            for r in repos
        ]

        # Let LLM pick the matching repo
        prompt = f"""You are matching a resume project claim to a GitHub repository.

Claimed project: "{project_name}"

Available GitHub repos:
{repo_list}

Return ONLY valid JSON:
{{
  "matched_repo": "exact_repo_name_or_null",
  "confidence": "high/medium/low",
  "reasoning": "one sentence"
}}"""

        text = generate(prompt)
        match = parse_json_response(text)
        matched_name = match.get("matched_repo")

        if not matched_name or matched_name == "null":
            return None

        # Fetch details of the matched repo
        repo_url = f"https://api.github.com/repos/{username}/{matched_name}"
        repo_response = requests.get(repo_url, headers=get_github_headers())

        if repo_response.status_code != 200:
            return None

        repo_data = repo_response.json()

        # Fetch languages used
        lang_url = f"https://api.github.com/repos/{username}/{matched_name}/languages"
        lang_response = requests.get(lang_url, headers=get_github_headers())
        languages = list(lang_response.json().keys()) if lang_response.status_code == 200 else []

        return {
            "repo_name": matched_name,
            "description": repo_data.get("description", ""),
            "languages": languages,
            "stars": repo_data.get("stargazers_count", 0),
            "last_updated": repo_data.get("updated_at", ""),
            "topics": repo_data.get("topics", []),
            "match_confidence": match.get("confidence"),
            "match_reasoning": match.get("reasoning"),
        }

    except Exception as e:
        print(f"  GitHub fetch failed: {e}")
        return None


def verify_claims(parsed_claims: dict) -> dict:
    verified = parsed_claims.copy()
    verified["verification_results"] = []

    github_username = parsed_claims.get("github_username")
    if github_username and github_username != "null":
        print(f"  GitHub profile found: {github_username}")
    else:
        print("  No GitHub profile found — using web search only")

    for project in parsed_claims.get("projects", []):
        project_name = project.get("name", "")
        tech_stack = ", ".join(project.get("tech_stack", []))
        candidate = parsed_claims.get("candidate_name", "")

        github_evidence = None

        # Try GitHub first if we have a username
        if github_username and github_username != "null":
            print(f"  Checking GitHub for: {project_name}")
            github_evidence = find_matching_repo(github_username, project_name)
            if github_evidence:
                print(f"  Found repo: {github_evidence['repo_name']} "
                      f"(confidence: {github_evidence['match_confidence']})")

        # Fall back to web search
        query = f"{candidate} {project_name} {tech_stack} project GitHub"
        web_evidence = search_web(query, max_results=3)
        web_text = "\n".join([f"- {e['title']}: {e['snippet']}" for e in web_evidence])

        # Build evidence summary for LLM
        evidence_summary = ""
        if github_evidence:
            evidence_summary += f"""
GitHub Repository Found:
- Repo: {github_evidence['repo_name']}
- Description: {github_evidence['description']}
- Languages: {github_evidence['languages']}
- Topics: {github_evidence['topics']}
- Last updated: {github_evidence['last_updated']}
- Match confidence: {github_evidence['match_confidence']}
"""
        if web_text:
            evidence_summary += f"\nWeb Search Results:\n{web_text}"

        if not evidence_summary:
            evidence_summary = "No evidence found online or on GitHub."

        prompt = f"""You are verifying a resume claim.

Candidate: {candidate}
Project claimed: {project_name}
Tech stack claimed: {tech_stack}

Evidence:
{evidence_summary}

Return ONLY valid JSON:
{{
  "confidence_score": 0.0,
  "status": "verified/unverified/suspicious",
  "reasoning": "one sentence explanation",
  "github_verified": true/false
}}"""

        text = generate(prompt)
        result = parse_json_response(text)

        verified["verification_results"].append({
            "type": "project",
            "name": project_name,
            "github_evidence": github_evidence,
            "web_evidence": web_evidence,
            "confidence_score": result.get("confidence_score", 0.5),
            "status": result.get("status", "unverified"),
            "reasoning": result.get("reasoning", ""),
            "github_verified": result.get("github_verified", False),
        })

    return verified