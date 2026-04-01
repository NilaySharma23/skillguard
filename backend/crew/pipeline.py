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
from dotenv import load_dotenv

load_dotenv()


# LangGraph requires a State class — this is the shared memory
# that gets passed between every node in the graph.
# Think of it as the "clipboard" all agents read from and write to.
class ScreeningState(TypedDict):
    resume_text: str
    jd_text: str
    parsed_claims: dict
    verified_claims: dict
    audited_claims: dict
    final_report: dict
    reverification_count: int  # prevents infinite loops


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

    # Only re-verify if critic explicitly flagged it AND confidence is very low
    # AND we haven't already re-verified twice
    if needs_reverif and avg_confidence < 0.3 and count < 2:
        print(f"  [LangGraph] Very low confidence ({avg_confidence:.2f}) — re-verifying (attempt {count + 1})")
        state["reverification_count"] = count + 1
        return "verifier"
    else:
        return "reporter"


def build_pipeline():
    """
    Builds and compiles the LangGraph state machine.
    
    The graph looks like:
    parser → verifier → critic → (conditional) → reporter → END
                  ↑__________________________|
                         (if low confidence)
    """
    graph = StateGraph(ScreeningState)

    # Add nodes (each is a function that takes + returns State)
    graph.add_node("parser", run_claim_parser)
    graph.add_node("verifier", run_verifier)
    graph.add_node("critic", run_critic)
    graph.add_node("reporter", run_reporter)

    # Add edges (the flow between nodes)
    graph.set_entry_point("parser")
    graph.add_edge("parser", "verifier")
    graph.add_edge("verifier", "critic")

    # Conditional edge — this is the self-correction loop
    graph.add_conditional_edges(
        "critic",
        should_reverify,
        {
            "verifier": "verifier",  # loop back
            "reporter": "reporter",  # proceed
        }
    )
    graph.add_edge("reporter", END)

    return graph.compile()


def screen_candidate(resume_text: str, jd_text: str) -> dict:
    """Main entry point — run a single candidate through the full pipeline."""
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

    print("\nRunning SkillGuard screening pipeline...")
    final_state = pipeline.invoke(initial_state)
    return final_state["final_report"]