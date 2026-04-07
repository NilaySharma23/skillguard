import PipelineSteps from "../components/PipelineSteps"
import { C } from "../constants/tokens"
import { useState, useEffect } from "react"

function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const m = String(Math.floor(elapsed / 60)).padStart(2, "0")
  const s = String(elapsed % 60).padStart(2, "0")
  return <span>{m}:{s}</span>
}

const STATUS_ICON = {
  pending:  "⏳",
  running:  "🔄",
  complete: "✓",
  failed:   "✗",
}

export default function LoadingView({ status, step, jobIds, jobStatuses }) {
  const total = jobIds?.length || 1
  const completed = Object.values(jobStatuses).filter(j => j.status === "complete").length

  return (
    <div className="anim-fade-in" style={{
      minHeight: "calc(100vh - 56px)",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Header strip ─────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center",
        borderBottom: `1px solid ${C.border}`,
        background: C.bgPanel,
      }}>
        <div style={{
          flex: 1, padding: "20px 40px",
          borderRight: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11, color: C.accent,
            letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500,
          }}>
            {status === "uploading" ? "Uploading Files" : "Pipeline Active"}
          </span>
        </div>

        <div style={{
          padding: "20px 40px",
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
        }}>
          <div className="mono">Candidates</div>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 14, fontWeight: 700, color: C.ink,
          }}>{total}</div>
        </div>

        <div style={{
          padding: "20px 40px",
          borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
        }}>
          <div className="mono">Elapsed</div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13, fontWeight: 500, color: C.ink,
          }}><ElapsedTimer /></div>
        </div>

        <div style={{
          padding: "20px 40px",
          display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
        }}>
          <div className="mono">Progress</div>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 14, fontWeight: 700, color: C.accent,
          }}>
            {completed} of {total} complete
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 40px",
      }}>
        <div style={{ width: "100%", maxWidth: 560 }}>
          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 32, fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.15,
              color: C.ink, marginBottom: 14,
            }}>
              Screening <span style={{ color: C.accent }}>
                {total} candidate{total !== 1 ? "s" : ""}
              </span>
            </h2>
            <p style={{
              fontSize: 14, color: C.inkMid, lineHeight: 1.75,
              maxWidth: 400, margin: "0 auto",
            }}>
              Each resume is processed independently through the 4-agent pipeline.
            </p>
          </div>

          {/* Per-candidate status (for multi) */}
          {total > 1 && Object.keys(jobStatuses).length > 0 && (
            <div style={{
              background: C.bgPanel,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 20,
            }}>
              <div className="mono" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Candidate Status</span>
              </div>
              {Object.entries(jobStatuses).map(([jid, js], i) => (
                <div key={jid} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
                  borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontSize: 14 }}>{STATUS_ICON[js.status] || "⏳"}</span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11, color: C.inkMid, flex: 1,
                  }}>
                    Candidate {i + 1} — {jid}
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: js.status === "complete" ? C.green
                         : js.status === "failed" ? C.red
                         : js.status === "running" ? C.accent
                         : C.inkDim,
                  }}>{js.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pipeline steps */}
          <div style={{
            background: C.bgPanel,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "28px 28px",
          }}>
            <div className="mono" style={{
              marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div className="pulse-dot" style={{ width: 5, height: 5 }} />
              <span>Live Pipeline</span>
            </div>
            <PipelineSteps current={status === "uploading" ? 0 : step} />
          </div>

          {/* Hint */}
          <div style={{
            marginTop: 20,
            padding: "12px 16px",
            borderRadius: 8,
            background: C.accentDim,
            border: `1px solid ${C.accent}20`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: C.accent, fontSize: 13, flexShrink: 0 }}>⚡</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: C.inkMid, lineHeight: 1.6,
            }}>
              {total > 1
                ? "Each candidate is processed in parallel when possible."
                : "GitHub verification adds ~3 API calls per project."
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}