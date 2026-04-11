# SkillGuard AI

**AI-native hiring intelligence platform that verifies resume claims before you waste time interviewing.**

🌐 **Live:** [skillguard-ai-981714279674.us-central1.run.app](https://skillguard-ai-981714279674.us-central1.run.app)

---

## The Problem

Hiring managers interview candidates based on what's written on a resume — a document the candidate wrote about themselves. There is no standard check for whether those claims are real. Skills get inflated. Projects get exaggerated. Irrelevant experience gets rephrased to sound relevant.

SkillGuard fixes this. Upload a resume and a job description. In under 60 seconds, you get a structured report telling you exactly what's verified, what looks suspicious, and targeted interview questions based on the candidate's specific claims.

---

## How It Works

```
Resume PDF + JD PDF
        ↓
[Agent 1] Claim Parser       — Extracts skills, projects, experience from resume
        ↓
[Agent 2] Verifier Agent     — Cross-checks claims against GitHub repos + web search
        ↓
[Agent 3] Critic Agent       — Detects hallucinations, scores credibility, flags risks
        ↓
[Agent 4] Reporter Agent     — Generates match score + interview questions + verdict
        ↓
Structured Hiring Report
```

The pipeline runs on **LangGraph** with conditional re-verification logic — if the critic agent flags low confidence, it loops back to the verifier automatically.

---

## Features

### Core Pipeline
- **4-agent LangGraph pipeline** with stateful orchestration and automatic re-verification loops
- **GitHub verification** — finds matching repos using LLM-assisted fuzzy name matching, then fetches languages, topics, and activity
- **Web search fallback** — DuckDuckGo search for candidates without GitHub profiles
- **Groq + Gemini** — Llama 3.3 70B as primary LLM with Gemini 2.0 Flash fallback
- **Resume caching** — SHA-256 hash-based cache skips agents 1–3 when the same resume is re-evaluated against a different JD

### Batch Mode
- Upload up to 3 resumes + 1 JD simultaneously
- All resumes processed in parallel as independent background jobs
- Per-candidate polling with live status tracking

### Comparison Engine (Agent 5)
- Side-by-side comparison of any two screened candidates
- Scores across 4–6 categories: Technical Skills, Project Quality, Experience Relevance, Verification Credibility, etc.
- AI verdict with confidence rating and final hiring recommendation

### Report Contents
| Field | Description |
|-------|-------------|
| `match_score` | 0–100 score based on JD fit + claim credibility |
| `hiring_recommendation` | `strong_yes` / `yes` / `maybe` / `no` |
| `verified_strengths` | Claims backed by real evidence |
| `risk_flags` | Suspicious, exaggerated, or unverifiable claims |
| `recommended_interview_questions` | Targeted questions per unverified claim |
| `match_reasoning` | Plain-language verdict explanation |
| `summary` | 2–3 sentence executive summary |

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI |
| Orchestration | LangGraph (StateGraph with conditional edges) |
| Primary LLM | Groq — Llama 3.3 70B Versatile |
| Fallback LLM | Google Gemini 2.0 Flash |
| PDF Parsing | pypdf |
| Web Search | DuckDuckGo Search (ddgs) |
| GitHub API | REST via requests |
| Caching | File-based SHA-256 cache (tmpdir) |
| Background Jobs | FastAPI BackgroundTasks |
| Deployment | Docker on Google Cloud Run |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| HTTP | Axios |
| Dropzone | react-dropzone |
| Icons | lucide-react |
| Fonts | Syne (headings) + IBM Plex Mono (data) |
| Styling | Pure CSS variables (no CSS framework) |

---

## Architecture

```
skillguard-ai/
├── backend/
│   ├── agents/
│   │   ├── claim_parser.py     # Agent 1: Resume → structured JSON
│   │   ├── verifier.py         # Agent 2: GitHub + web verification
│   │   ├── critic.py           # Agent 3: Hallucination detection
│   │   ├── reporter.py         # Agent 4: Final report generation
│   │   ├── comparator.py       # Agent 5: Side-by-side comparison
│   │   └── llm_client.py       # Groq primary + Gemini fallback
│   ├── crew/
│   │   └── pipeline.py         # LangGraph StateGraph orchestration
│   ├── ingestion/
│   │   ├── loader.py           # PDF → text extraction
│   │   └── chunker.py          # Semantic chunking (LlamaIndex)
│   ├── vectorstore/
│   │   └── chroma_store.py     # ChromaDB + Google embeddings
│   ├── cache.py                # SHA-256 resume cache
│   ├── models/schemas.py       # Pydantic models
│   └── main.py                 # FastAPI app + endpoints
├── frontend/
│   └── src/
│       ├── views/              # IdleView, LoadingView, ReportView, DashboardView, CompareView, ErrorView
│       ├── components/         # Header, DropZone, ScoreRing, HireBadge, PipelineSteps
│       ├── hooks/useScreening.js  # All state + polling logic
│       └── constants/tokens.js    # Design tokens + theme CSS
├── Dockerfile
└── requirements.txt
```

---

## API Endpoints

```
POST /screen              — Single candidate screening (resume + JD)
GET  /status/{job_id}     — Poll job status + retrieve report

POST /screen-batch        — Batch screening (1 JD + up to 3 resumes)
GET  /batch/{batch_id}    — Poll batch status

POST /compare             — Compare two completed reports (Agent 5)
GET  /health              — Health check
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Groq API key (free tier: 14,400 req/day)
- Gemini API key (fallback, optional but recommended)
- GitHub token (optional — raises rate limits from 60 to 5000 req/hr)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Add: GROQ_API_KEY, GEMINI_API_KEY, GITHUB_TOKEN

uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Docker

```bash
# Build frontend first
cd frontend && npm run build && cd ..

# Build and run
docker build -t skillguard-ai .
docker run -p 8000:8000 \
  -e GROQ_API_KEY=your_key \
  -e GEMINI_API_KEY=your_key \
  skillguard-ai
```

---

## Key Design Decisions

**Why LangGraph instead of a simple sequential pipeline?**
The conditional re-verification loop requires stateful orchestration. LangGraph's `StateGraph` with conditional edges lets the critic agent trigger another verification pass without duplicating code.

**Why Groq + Llama 3.3 70B?**
14,400 free requests/day vs ~50 for Gemini free tier. During development this is the difference between building fast and hitting quota every hour. The open-weight model also means zero vendor lock-in.

**Why SHA-256 resume caching?**
The most expensive step (agents 1–3) is re-running for the same resume against a different job description. Caching by content hash makes this nearly instant.

**Why fuzzy repo matching via LLM instead of string search?**
A project named "Fraud Detection System" on a resume might be a repo named `fraud-detect`, `financial-fraud-ml`, or `igihackathon-2025`. Exact string matching fails here. The LLM matches by semantic meaning.

---

## Limitations

- Background job state is in-memory — restarts clear all jobs (no persistent job store)
- Cache is filesystem-based — not shared across container instances
- Rate limits on Groq free tier can slow batch jobs with 3 resumes
- Web search results vary in quality — GitHub verification is significantly more reliable

---

## License

MIT