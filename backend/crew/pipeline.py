# backend/crew/pipeline.py

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import TypedDict
from langgraph.graph import StateGraph, END
from agents.claim_parser import parse_claims
from agents.verifier import verify_claims
from agents.critic import audit_claims
from agents.reporter import generate_report
from cache import resume_hash, get_cached, set_cache
from dotenv import load_dotenv

load_dotenv()


class ScreeningState(TypedDict):
    resume_text: str
    jd_text: str
    parsed_claims: dict
    verified_claims: dict
    audited_claims: dict
    final_report: dict
    reverification_count: int


def run_claim_parser(state: ScreeningState) -> ScreeningState:
    print("  [Agent 1] Parsing claims from resume...")
    state["parsed_claims"] = parse_claims(state["resume_text"])
    print(f"  Found {len(state['parsed_claims'].get('skills', []))} skills, "
          f"{len(state['parsed_claims'].get('projects', []))} projects")
    return state


def run_verifier(state: ScreeningState) -> ScreeningState:
    print("  [Agent 2] Verifying claims against web...")
    state["verified_claims"] = verify_claims(state["parsed_claims"])
    return state


def run_critic(state: ScreeningState) -> ScreeningState:
    print("  [Agent 3] Auditing for hallucinations and bias...")
    state["audited_claims"] = audit_claims(state["verified_claims"])
    avg = state["audited_claims"].get("avg_confidence", 1.0)
    print(f"  Average confidence: {avg:.2f}")
    return state


def run_reporter(state: ScreeningState) -> ScreeningState:
    print("  [Agent 4] Generating final report...")
    state["final_report"] = generate_report(
        state["audited_claims"],
        state["jd_text"]
    )
    return state


def should_reverify(state: ScreeningState) -> str:
    needs_reverif = state["audited_claims"].get("audit", {}).get("needs_reverification", False)
    avg_confidence = state["audited_claims"].get("avg_confidence", 1.0)
    count = state.get("reverification_count", 0)

    if needs_reverif and avg_confidence < 0.3 and count < 2:
        print(f"  [LangGraph] Very low confidence ({avg_confidence:.2f}) — re-verifying (attempt {count + 1})")
        state["reverification_count"] = count + 1
        return "verifier"
    else:
        return "reporter"


def build_pipeline():
    graph = StateGraph(ScreeningState)
    graph.add_node("parser", run_claim_parser)
    graph.add_node("verifier", run_verifier)
    graph.add_node("critic", run_critic)
    graph.add_node("reporter", run_reporter)

    graph.set_entry_point("parser")
    graph.add_edge("parser", "verifier")
    graph.add_edge("verifier", "critic")
    graph.add_conditional_edges(
        "critic",
        should_reverify,
        {
            "verifier": "verifier",
            "reporter": "reporter",
        }
    )
    graph.add_edge("reporter", END)
    return graph.compile()


def build_cached_pipeline():
    """Pipeline that starts from reporter (skips agents 1-3)."""
    graph = StateGraph(ScreeningState)
    graph.add_node("reporter", run_reporter)
    graph.set_entry_point("reporter")
    graph.add_edge("reporter", END)
    return graph.compile()


def screen_candidate(resume_text: str, jd_text: str) -> dict:
    """Main entry point — run a single candidate through the full pipeline."""
    r_hash = resume_hash(resume_text)
    cached = get_cached(r_hash)

    if cached:
        # Cache hit — skip agents 1-3, only run reporter with this JD
        print("\nRunning SkillGuard pipeline (CACHED — skipping parse/verify/audit)...")
        pipeline = build_cached_pipeline()
        initial_state = ScreeningState(
            resume_text=resume_text,
            jd_text=jd_text,
            parsed_claims=cached["parsed_claims"],
            verified_claims=cached["verified_claims"],
            audited_claims=cached["audited_claims"],
            final_report={},
            reverification_count=0,
        )
        final_state = pipeline.invoke(initial_state)
        return final_state["final_report"]

    # Cache miss — run full pipeline
    print("\nRunning SkillGuard screening pipeline...")
    pipeline = build_pipeline()
    initial_state = ScreeningState(
        resume_text=resume_text,
        jd_text=jd_text,
        parsed_claims={},
        verified_claims={},
        audited_claims={},
        final_report={},
        reverification_count=0,
    )
    final_state = pipeline.invoke(initial_state)

    # Save to cache for next time
    set_cache(r_hash, {
        "parsed_claims": final_state["parsed_claims"],
        "verified_claims": final_state["verified_claims"],
        "audited_claims": final_state["audited_claims"],
    })

    return final_state["final_report"]