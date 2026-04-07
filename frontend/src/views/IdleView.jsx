import DropZone from "../components/DropZone"
import { C } from "../constants/tokens"

export default function IdleView({ resumes, addResumes, removeResume, jd, setJd, onSubmit }) {
  const ready = resumes.length > 0 && jd

  return (
    <div className="anim-fade-in">

      {/* ── Hero — full width ───────────────────────── */}
      <div style={{
        background: C.bgPanel,
        borderBottom: `1px solid ${C.border}`,
        padding: "80px 48px 72px",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500,
          background: `radial-gradient(ellipse, ${C.accent}10 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
            <div style={{ height: 1.5, width: 28, background: C.accent }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10, letterSpacing: "0.14em",
              textTransform: "uppercase", color: C.accent,
            }}>Hiring Intelligence Platform</span>
            <div style={{ height: 1.5, width: 28, background: C.accent }} />
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(42px, 6vw, 76px)",
            fontWeight: 800, lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: C.ink, marginBottom: 32,
          }}>
            Stop trusting<br />
            <span style={{
              color: "transparent",
              WebkitTextStroke: `2px ${C.accent}`,
            }}>unverified</span> resumes.
          </h1>

          {/* Subtitle — written for HR, not engineers */}
          <p style={{
            fontSize: 18, color: C.inkMid, lineHeight: 1.85,
            maxWidth: 640, margin: "0 auto",
          }}>
            Before you interview a candidate, know what's real on their resume and what isn't.
            SkillGuard reads every claim — skills, projects, experience — and checks it against
            real evidence from GitHub, the web, and public records.
            <br /><br />
            You'll get a clear, structured report in under 60 seconds telling you exactly
            what's verified, what looks exaggerated, and smart questions to ask in the interview.
            No technical setup. No guesswork. Just upload two PDFs and let AI do the background check.
          </p>
        </div>
      </div>

      {/* ── Stats bar — horizontal, full width ─────── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
      }}>
        {[
          { val: "4",    label: "AI Agents",    desc: "Working together to verify every claim" },
          { val: "60s",  label: "Avg. Runtime",  desc: "From upload to a complete hiring report" },
          { val: "100%", label: "Verifiable",    desc: "Every claim is cross-checked with real sources" },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1, padding: "32px 48px",
            borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            display: "flex", alignItems: "center", gap: 20,
            justifyContent: "center",
          }}>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 48, fontWeight: 800,
              color: C.accent, lineHeight: 1, flexShrink: 0,
            }}>{s.val}</div>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4,
              }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.inkDim }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 01 Upload Documents — full width, side-by-side dropzones ── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 64px",
      }}>
        <div className="mono" style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ color: C.accent }}>01</span>
          <span style={{ color: C.borderStrong }}>—</span>
          <span>Upload Documents</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 900,
          margin: "0 auto 28px",
        }}>
          <DropZone
            label="Candidate Resumes"
            sublabel="Up to 3 PDFs"
            icon="📄"
            multiple
            files={resumes}
            onFile={addResumes}
            onRemove={removeResume}
          />
          <DropZone label="Job Description" sublabel="PDF format" icon="📋" onFile={setJd} file={jd} />
        </div>

        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <button className="btn btn-accent" style={{ width: "100%" }} onClick={onSubmit} disabled={!ready}>
            {ready
              ? `Screen ${resumes.length} Candidate${resumes.length !== 1 ? "s" : ""} →`
              : "Upload resume(s) and JD to continue"}
          </button>
        </div>
      </div>

      {/* ── 02 What the Report Includes — full width ── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "56px 64px",
      }}>
        <div className="mono" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ color: C.accent }}>02</span>
          <span style={{ color: C.borderStrong }}>—</span>
          <span>What the Report Includes</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          {[
            { icon: "◎", label: "Match Score",          desc: "A 0–100 rating showing how well the candidate fits your job description" },
            { icon: "✓", label: "Hire Recommendation",  desc: "A clear verdict: Strong Hire, Hire, Maybe, or No Hire" },
            { icon: "⊕", label: "Verified Strengths",   desc: "Skills and experience backed by real evidence we found online" },
            { icon: "⚑", label: "Risk Flags",           desc: "Claims that look exaggerated, unverifiable, or inconsistent" },
            { icon: "?", label: "Interview Questions",   desc: "Targeted questions based on the candidate's specific claims to ask in the interview" },
            { icon: "≡", label: "Match Reasoning",      desc: "A plain-language explanation of why we gave this verdict" },
          ].map((item, i) => (
            <div key={item.label} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "24px 32px",
              borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
              borderRight: (i % 3 !== 2) ? `1px solid ${C.border}` : "none",
              textAlign: "left",
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 14, color: C.accent, flexShrink: 0, marginTop: 2,
              }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: C.inkDim, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 03 How It Works — full width ──────────── */}
      <div style={{
        padding: "56px 64px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div className="mono" style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ color: C.accent }}>03</span>
          <span style={{ color: C.borderStrong }}>—</span>
          <span>How It Works</span>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 40,
          maxWidth: 1100,
          margin: "0 auto",
        }}>
          {[
            {
              n: "1",
              title: "You upload two PDFs",
              body: "The candidate's resume and the job description you're hiring for. That's it — no account setup, no configuration, no technical knowledge needed.",
            },
            {
              n: "2",
              title: "AI reads and verifies every claim",
              body: "Four AI agents go to work. They extract every skill and project mentioned in the resume, then check them against GitHub repositories and live web searches to see what's real.",
            },
            {
              n: "3",
              title: "You get a structured hiring report",
              body: "In under 60 seconds, you receive a verified breakdown — what checks out, what's exaggerated, a match score, and interview questions targeted at the candidate's specific claims.",
            },
          ].map(step => (
            <div key={step.n} style={{ textAlign: "left" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 20,
                background: C.accentDim, border: `1px solid ${C.accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
                color: C.accent, fontWeight: 600,
              }}>{step.n}</div>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 10,
              }}>{step.title}</div>
              <div style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.75 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}