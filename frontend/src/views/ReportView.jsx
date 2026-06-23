import ScoreRing from "../components/ScoreRing"
import HireBadge from "../components/HireBadge"
import { C } from "../constants/tokens"

// Maps each interview-question category to a label + accent color so the
// hiring manager can see at a glance what kind of probe each question is.
const CATEGORY_META = {
  claim_verification: { label: "Claim Check",      color: C.accent },
  problem_solving:    { label: "Problem Solving",  color: C.amber  },
  critical_thinking:  { label: "Critical Thinking",color: C.amber  },
  adaptability:       { label: "Adaptability",     color: C.accent },
  domain_knowledge:   { label: "Domain Depth",     color: C.accent },
  education:          { label: "Education",         color: C.inkMid },
}

function categoryMeta(cat) {
  return CATEGORY_META[cat] || { label: cat || "Targets", color: C.accent }
}

function StatCell({ label, value, accent, noBorder }) {
  return (
    <div style={{
      flex: 1, padding: "20px 32px",
      borderRight: noBorder ? "none" : `1px solid ${C.border}`,
    }}>
      <div className="mono" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
        color: accent || C.ink, lineHeight: 1,
      }}>{value}</div>
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 14, fontWeight: 700,
        color: C.ink, letterSpacing: "-0.01em", marginBottom: 10,
      }}>{children}</h3>
      <div style={{ height: 1, background: C.border }} />
    </div>
  )
}

export default function ReportView({ report, onReset, onBack }) {
  const strengthCount = report.verified_strengths?.length || 0
  const flagCount     = report.risk_flags?.length || 0

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Stats bar — full bleed ──────────────────── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{
            flex: 2, padding: "20px 32px",
            borderRight: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", justifyContent: "center", gap: 6,
          }}>
            <div className="mono">Candidate</div>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800,
              letterSpacing: "-0.025em", color: C.ink,
            }}>{report.candidate_name}</span>
          </div>

          <div style={{
            padding: "14px 28px", borderRight: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", flexShrink: 0,
          }}>
            <ScoreRing score={report.match_score} size={90} />
          </div>

          <div style={{
            flex: 1.5, padding: "20px 28px",
            borderRight: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column", justifyContent: "center", gap: 8,
          }}>
            <div className="mono">Recommendation</div>
            <HireBadge rec={report.hiring_recommendation} />
          </div>

          <StatCell label="Verified Strengths" value={strengthCount} accent={C.green} />
          <StatCell label="Risk Flags" value={flagCount} accent={flagCount > 0 ? C.red : C.inkMid} noBorder />
        </div>
      </div>

      {/* ── Summary — full bleed, centered ─────────── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bgPanel }}>
        <div style={{ padding: "36px 64px", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.inkDim, marginBottom: 16,
          }}>Summary</h2>
          <p style={{
            fontSize: 15, color: C.inkMid, lineHeight: 1.85,
            maxWidth: 760, margin: "0 auto",
          }}>{report.summary}</p>
        </div>
      </div>

      {/* ── Main dashboard — equal two-column with padding + gap ─── */}
      <div style={{
        padding: "0 32px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          minHeight: "60vh",
          paddingTop: 12,
          paddingBottom: 12,
        }}>

          {/* LEFT — Strengths + Flags + Reasoning */}
          <div style={{
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>

            {/* Strengths + Flags side by side */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ padding: "28px 28px", borderRight: `1px solid ${C.border}` }}>
                <SectionHeading>Verified Strengths</SectionHeading>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {report.verified_strengths?.map((s, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: C.greenDim, border: `1px solid ${C.green}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: C.green, fontWeight: 800, marginTop: 2,
                      }}>✓</div>
                      <span style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6, textAlign: "left" }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: "28px 28px" }}>
                <SectionHeading>Risk Flags</SectionHeading>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                  {report.risk_flags?.map((r, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: C.redDim, border: `1px solid ${C.red}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 8, color: C.red, fontWeight: 800, marginTop: 2,
                      }}>!</div>
                      <span style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6, textAlign: "left" }}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Match Reasoning */}
            <div style={{ flex: 1, padding: "28px 28px" }}>
              <SectionHeading>Match Reasoning</SectionHeading>
              <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.85, textAlign: "left" }}>
                {report.match_reasoning}
              </p>
            </div>
          </div>

          {/* RIGHT — Interview Questions */}
          <div style={{
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: "auto",
            padding: "28px 28px",
          }}>
            <SectionHeading>Interview Questions</SectionHeading>
            {report.recommended_interview_questions?.map((q, i) => {
              const meta = categoryMeta(q.category)
              return (
                <div key={i} className="iq-row">
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, color: C.inkDim,
                    paddingTop: 3, flexShrink: 0, minWidth: 24,
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, marginBottom: 10, textAlign: "left" }}>
                      {q.question}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
                        color: meta.color, background: `${meta.color}1A`,
                        border: `1px solid ${meta.color}`,
                        padding: "3px 9px", borderRadius: 4, display: "inline-block",
                      }}>{meta.label}</span>
                      {q.targets && (
                        <span style={{ fontSize: 11, color: C.inkDim, textAlign: "left" }}>
                          {q.targets}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Experience & Adaptability + Education ───── */}
      {(report.experience_assessment || report.education) && (
        <div style={{ padding: "0 32px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: report.experience_assessment && report.education ? "1.4fr 1fr" : "1fr",
            gap: 12, paddingTop: 12, paddingBottom: 12,
          }}>

            {/* Experience & Adaptability */}
            {report.experience_assessment && (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 28px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <SectionHeading>Experience &amp; Adaptability</SectionHeading>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
                    color: C.accent, lineHeight: 1, flexShrink: 0,
                  }}>{report.experience_assessment.score}<span style={{ fontSize: 12, color: C.inkDim }}>/100</span></span>
                </div>

                {report.experience_assessment.environments?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {report.experience_assessment.environments.map((env, i) => (
                      <span key={i} style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10, letterSpacing: "0.04em",
                        color: C.inkMid, background: C.bgInput,
                        border: `1px solid ${C.border}`,
                        padding: "4px 10px", borderRadius: 4,
                      }}>{env}</span>
                    ))}
                  </div>
                )}

                {report.experience_assessment.adaptability && (
                  <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, marginBottom: 10, textAlign: "left" }}>
                    {report.experience_assessment.adaptability}
                  </p>
                )}
                {report.experience_assessment.reasoning && (
                  <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.75, textAlign: "left" }}>
                    {report.experience_assessment.reasoning}
                  </p>
                )}
              </div>
            )}

            {/* Education */}
            {report.education && (
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 28px" }}>
                <SectionHeading>Education</SectionHeading>
                <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.6, marginBottom: 10, textAlign: "left" }}>
                  {report.education.summary}
                </p>
                {report.education.relevance && (
                  <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.75, textAlign: "left" }}>
                    {report.education.relevance}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer — full bleed ─────────────────────── */}
      <div style={{ padding: "24px 40px", display: "flex", gap: 12 }}>
        {onBack && (
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onBack}>
            ← Back to Dashboard
          </button>
        )}
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onReset}>
          ← Screen another candidate
        </button>
      </div>
    </div>
  )
}