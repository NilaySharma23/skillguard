import ScoreRing from "../components/ScoreRing"
import HireBadge from "../components/HireBadge"
import { C } from "../constants/tokens"

export default function CompareView({ comparison, reportA, reportB, onBack }) {
  if (!comparison) return null

  const cats = comparison.categories || []

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Header: A vs B ───────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        borderBottom: `1px solid ${C.border}`, background: C.bgPanel,
      }}>
        {/* Candidate A */}
        <div style={{
          padding: "28px 40px",
          display: "flex", alignItems: "center", gap: 20,
          borderRight: `1px solid ${C.border}`,
        }}>
          <ScoreRing score={reportA?.match_score} size={64} />
          <div>
            <div className="mono" style={{ marginBottom: 6 }}>Candidate A</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
              color: C.ink, marginBottom: 6,
            }}>{comparison.candidate_a_name}</div>
            <HireBadge rec={reportA?.hiring_recommendation} />
          </div>
        </div>

        {/* VS badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 28px",
          borderRight: `1px solid ${C.border}`,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: C.accentDim, border: `2px solid ${C.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800,
            color: C.accent,
          }}>VS</div>
        </div>

        {/* Candidate B */}
        <div style={{
          padding: "28px 40px",
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <ScoreRing score={reportB?.match_score} size={64} />
          <div>
            <div className="mono" style={{ marginBottom: 6 }}>Candidate B</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
              color: C.ink, marginBottom: 6,
            }}>{comparison.candidate_b_name}</div>
            <HireBadge rec={reportB?.hiring_recommendation} />
          </div>
        </div>
      </div>

      {/* ── AI Verdict ───────────────────────────────── */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "32px 48px", textAlign: "center",
        background: C.bgPanel,
      }}>
        <div className="mono" style={{ marginBottom: 12 }}>AI Verdict</div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
          color: C.accent, marginBottom: 14,
        }}>
          Recommended: {comparison.winner}
        </div>
        <p style={{
          fontSize: 14, color: C.inkMid, lineHeight: 1.8,
          maxWidth: 640, margin: "0 auto",
        }}>{comparison.summary}</p>
        <div style={{
          marginTop: 12,
          display: "inline-flex", padding: "4px 14px", borderRadius: 999,
          background: C.accentDim, border: `1px solid ${C.accent}20`,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, color: C.accent, textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          Confidence: {comparison.confidence}
        </div>
      </div>

      {/* ── Category Breakdown ───────────────────────── */}
      <div style={{ padding: "24px 32px", borderBottom: `1px solid ${C.border}` }}>
        <div className="mono" style={{ marginBottom: 16, textAlign: "center" }}>Category Breakdown</div>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr",
          gap: 8, maxWidth: 800, margin: "0 auto",
        }}>
          {cats.map((cat, i) => {
            const maxScore = Math.max(cat.candidate_a_score, cat.candidate_b_score, 1)
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "140px 1fr auto 1fr",
                alignItems: "center", gap: 12,
                padding: "14px 20px", borderRadius: 8,
                background: C.bgPanel, border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700,
                  color: C.ink, textAlign: "left",
                }}>{cat.category}</div>

                {/* A bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12, fontWeight: 600,
                    color: cat.edge === "A" ? C.accent : C.inkMid,
                  }}>{cat.candidate_a_score}</span>
                  <div style={{
                    height: 6, borderRadius: 3,
                    width: `${(cat.candidate_a_score / 10) * 100}%`,
                    minWidth: 4,
                    background: cat.edge === "A" ? C.accent : C.borderMid,
                    transition: "width 0.4s ease",
                  }} />
                </div>

                {/* Edge indicator */}
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 9, color: C.inkDim, textTransform: "uppercase",
                  letterSpacing: "0.06em", minWidth: 24, textAlign: "center",
                }}>
                  {cat.edge === "Tie" ? "=" : cat.edge}
                </div>

                {/* B bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    height: 6, borderRadius: 3,
                    width: `${(cat.candidate_b_score / 10) * 100}%`,
                    minWidth: 4,
                    background: cat.edge === "B" ? C.accent : C.borderMid,
                    transition: "width 0.4s ease",
                  }} />
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12, fontWeight: 600,
                    color: cat.edge === "B" ? C.accent : C.inkMid,
                  }}>{cat.candidate_b_score}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Relative Strengths ───────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ padding: "28px 32px", borderRight: `1px solid ${C.border}` }}>
          <div className="mono" style={{ marginBottom: 14 }}>
            {comparison.candidate_a_name}'s Strengths
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {comparison.candidate_a_strengths?.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  background: C.greenDim, border: `1px solid ${C.green}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 7, color: C.green, fontWeight: 800, marginTop: 2,
                }}>✓</div>
                <span style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.5, textAlign: "left" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <div className="mono" style={{ marginBottom: 14 }}>
            {comparison.candidate_b_name}'s Strengths
          </div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {comparison.candidate_b_strengths?.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                  background: C.greenDim, border: `1px solid ${C.green}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 7, color: C.green, fontWeight: 800, marginTop: 2,
                }}>✓</div>
                <span style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.5, textAlign: "left" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Final Recommendation ─────────────────────── */}
      <div style={{
        padding: "28px 48px", textAlign: "center",
        borderBottom: `1px solid ${C.border}`,
        background: C.bgPanel,
      }}>
        <div className="mono" style={{ marginBottom: 12 }}>Final Recommendation</div>
        <p style={{
          fontSize: 14, color: C.inkMid, lineHeight: 1.85,
          maxWidth: 640, margin: "0 auto",
        }}>{comparison.recommendation}</p>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div style={{ padding: "24px 40px" }}>
        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}
