import { useState } from "react"
import HireBadge from "../components/HireBadge"
import { C } from "../constants/tokens"

export default function DashboardView({ reports, onViewReport, onCompare, comparing, onReset }) {
  const [sortBy, setSortBy] = useState("score") // score | recommendation | strengths | flags
  const [sortDir, setSortDir] = useState("desc")
  const [selected, setSelected] = useState([])   // indices for comparison
  const [showCompareSelect, setShowCompareSelect] = useState(false)

  const recOrder = { strong_yes: 4, yes: 3, maybe: 2, no: 1 }

  const sorted = [...reports].map((r, i) => ({ ...r, _idx: i })).sort((a, b) => {
    let av, bv
    if (sortBy === "score") { av = a.match_score || 0; bv = b.match_score || 0 }
    else if (sortBy === "recommendation") {
      av = recOrder[a.hiring_recommendation?.toLowerCase()?.replace(/\s+/g, "_")] || 0
      bv = recOrder[b.hiring_recommendation?.toLowerCase()?.replace(/\s+/g, "_")] || 0
    }
    else if (sortBy === "strengths") { av = a.verified_strengths?.length || 0; bv = b.verified_strengths?.length || 0 }
    else if (sortBy === "flags") { av = a.risk_flags?.length || 0; bv = b.risk_flags?.length || 0 }
    return sortDir === "desc" ? bv - av : av - bv
  })

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc")
    else { setSortBy(col); setSortDir("desc") }
  }

  function toggleSelect(idx) {
    setSelected(prev => {
      if (prev.includes(idx)) return prev.filter(i => i !== idx)
      if (prev.length >= 2) return [prev[1], idx]
      return [...prev, idx]
    })
  }

  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((s, r) => s + (r.match_score || 0), 0) / reports.length)
    : 0

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Summary bar ──────────────────────────────── */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.border}`, background: C.bgPanel,
      }}>
        {[
          { label: "Candidates Screened", value: reports.length },
          { label: "Average Score", value: avgScore, accent: true },
          { label: "Recommended", value: reports.filter(r => ["yes", "strong_yes"].includes(r.hiring_recommendation?.toLowerCase()?.replace(/\s+/g, "_"))).length, green: true },
          { label: "Flagged", value: reports.filter(r => (r.risk_flags?.length || 0) > 2).length, red: true },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1, padding: "24px 32px",
            borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
          }}>
            <div className="mono">{s.label}</div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800,
              color: s.accent ? C.accent : s.green ? C.green : s.red ? C.red : C.ink,
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Actions bar ──────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 32px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
          color: C.ink, flex: 1,
        }}>Screening Results</h2>

        {reports.length >= 2 && !showCompareSelect && (
          <button
            className="btn btn-accent"
            style={{ padding: "10px 20px", fontSize: 13 }}
            onClick={() => setShowCompareSelect(true)}
          >
            Compare Two Candidates
          </button>
        )}

        {showCompareSelect && (
          <>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11, color: C.inkMid,
            }}>
              Select 2 candidates ({selected.length}/2)
            </span>
            <button
              className="btn btn-accent"
              style={{ padding: "10px 20px", fontSize: 13 }}
              disabled={selected.length !== 2 || comparing}
              onClick={() => {
                onCompare(reports[selected[0]], reports[selected[1]])
                setShowCompareSelect(false)
                setSelected([])
              }}
            >
              {comparing ? "Comparing…" : "Run Comparison →"}
            </button>
            <button
              className="btn btn-ghost"
              style={{ padding: "10px 16px", fontSize: 13 }}
              onClick={() => { setShowCompareSelect(false); setSelected([]) }}
            >
              Cancel
            </button>
          </>
        )}

        <button className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: 13 }} onClick={onReset}>
          ← New Batch
        </button>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div style={{ padding: "0 32px 32px" }}>
        <table style={{
          width: "100%", borderCollapse: "separate", borderSpacing: "0 8px",
          marginTop: 8,
        }}>
          <thead>
            <tr>
              {showCompareSelect && <th style={thStyle}></th>}
              <th style={thStyle}>#</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Candidate</th>
              <ThSortable label="Score" col="score" current={sortBy} dir={sortDir} onSort={toggleSort} />
              <ThSortable label="Recommendation" col="recommendation" current={sortBy} dir={sortDir} onSort={toggleSort} />
              <ThSortable label="Strengths" col="strengths" current={sortBy} dir={sortDir} onSort={toggleSort} />
              <ThSortable label="Flags" col="flags" current={sortBy} dir={sortDir} onSort={toggleSort} />
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r._idx} style={{
                background: C.bgPanel,
                borderRadius: 10,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
              onMouseLeave={e => e.currentTarget.style.background = C.bgPanel}
              onClick={() => !showCompareSelect && onViewReport(r)}
              >
                {showCompareSelect && (
                  <td style={tdStyle}>
                    <div
                      onClick={e => { e.stopPropagation(); toggleSelect(r._idx) }}
                      style={{
                        width: 20, height: 20, borderRadius: 5,
                        border: `2px solid ${selected.includes(r._idx) ? C.accent : C.borderMid}`,
                        background: selected.includes(r._idx) ? C.accentDim : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 10, color: C.accent, fontWeight: 800,
                      }}
                    >
                      {selected.includes(r._idx) ? "✓" : ""}
                    </div>
                  </td>
                )}
                <td style={{ ...tdStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.inkDim }}>
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td style={{ ...tdStyle, textAlign: "left" }}>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
                    color: C.ink,
                  }}>{r.candidate_name || `Candidate ${i + 1}`}</span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: (r.match_score || 0) >= 70 ? C.green : (r.match_score || 0) >= 50 ? C.amber : C.red,
                    }} />
                    <span style={{
                      fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
                      color: (r.match_score || 0) >= 70 ? C.green : (r.match_score || 0) >= 50 ? C.amber : C.red,
                    }}>{r.match_score || 0}</span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <HireBadge rec={r.hiring_recommendation} />
                </td>
                <td style={{ ...tdStyle, fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: C.green }}>
                  {r.verified_strengths?.length || 0}
                </td>
                <td style={{ ...tdStyle, fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: (r.risk_flags?.length || 0) > 0 ? C.red : C.inkDim }}>
                  {r.risk_flags?.length || 0}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10, color: C.accent, cursor: "pointer",
                  }}>View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 10, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--sg-ink-dim)",
  padding: "8px 16px", textAlign: "center",
  fontWeight: 500,
}

const tdStyle = {
  padding: "16px 16px",
  textAlign: "center",
  verticalAlign: "middle",
}

function ThSortable({ label, col, current, dir, onSort }) {
  const active = current === col
  return (
    <th style={{ ...thStyle, cursor: "pointer", userSelect: "none" }} onClick={() => onSort(col)}>
      {label} {active ? (dir === "desc" ? "↓" : "↑") : ""}
    </th>
  )
}
