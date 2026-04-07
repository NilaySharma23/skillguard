import { C } from "../constants/tokens"

const BADGE_MAP = {
  strong_yes: { label: "Strong Hire", bg: C.greenDim,  color: C.green, border: `${C.green}44` },
  yes:        { label: "Hire",        bg: C.greenDim,  color: C.green, border: `${C.green}44` },
  maybe:      { label: "Maybe",       bg: C.amberDim,  color: C.amber, border: `${C.amber}44` },
  no:         { label: "No Hire",     bg: C.redDim,    color: C.red,   border: `${C.red}44`   },
}

export default function HireBadge({ rec }) {
  const key = rec?.toLowerCase()?.replace(/\s+/g, "_")
  const s = BADGE_MAP[key] || BADGE_MAP.maybe
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "6px 18px", borderRadius: 6,
      fontFamily: "'Syne', sans-serif",
      fontSize: 16, fontWeight: 800, letterSpacing: "0.02em",
      textTransform: "uppercase",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  )
}