import { C } from "../constants/tokens"

export const STEPS = [
  { id: "parse",   label: "Claim Parser",    desc: "Extracting skills, projects & experience" },
  { id: "verify",  label: "Verifier Agent",  desc: "Cross-checking GitHub repos & web sources" },
  { id: "audit",   label: "Critic Agent",    desc: "Detecting hallucinations & scoring gaps" },
  { id: "report",  label: "Reporter Agent",  desc: "Scoring fit & generating interview questions" },
]

export default function PipelineSteps({ current }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {STEPS.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "idle"
        return (
          <div key={s.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "12px 14px", borderRadius: 8,
            background: state === "active" ? C.accentDim : "transparent",
            border: `1px solid ${state === "active" ? C.accent + "33" : "transparent"}`,
            transition: "all 0.25s",
            opacity: state === "done" ? 0.35 : 1,
          }}>
            {/* Step indicator */}
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500,
              background: state === "done" ? C.accentDim
                        : state === "active" ? C.accent
                        : C.bgCardHover,
              color: state === "done" ? C.accent
                   : state === "active" ? "#000"
                   : C.inkDim,
              border: `1px solid ${
                state === "done" ? C.accent + "44"
                : state === "active" ? "transparent"
                : C.border
              }`,
              transition: "all 0.25s",
            }}>
              {state === "done" ? "✓" : String(i + 1).padStart(2, "0")}
            </div>

            {/* Label */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 13, fontWeight: 700,
                color: state === "active" ? C.accent : C.ink,
                marginBottom: state === "active" ? 3 : 0,
                transition: "color 0.25s",
              }}>
                {s.label}
              </div>
              {state === "active" && (
                <div style={{ fontSize: 11, color: C.inkMid }}>{s.desc}</div>
              )}
            </div>

            {/* Active pulse */}
            {state === "active" && <div className="pulse-dot" />}
          </div>
        )
      })}
    </div>
  )
}