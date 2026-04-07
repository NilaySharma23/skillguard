import { C } from "../constants/tokens"

export default function Header({ theme, onToggleTheme }) {
  return (
    <header style={{
      background: C.bgPanel,
      borderBottom: `1px solid ${C.border}`,
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 100,
      transition: "background 0.25s ease",
    }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 40px", width: "100%" }}>

        {/* Logo */}
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: C.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            color: "var(--sg-btn-accent-text)",
            fontWeight: 800, fontSize: 13,
            fontFamily: "'Syne', sans-serif",
          }}>S</span>
        </div>

        <span style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 16, letterSpacing: "-0.02em", color: C.ink,
        }}>SkillGuard</span>

        <span className="tag" style={{ background: C.accentDim, color: C.accent }}>AI</span>

        <div style={{ flex: 1 }} />

        {/* Theme toggle */}
        <button onClick={onToggleTheme} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.borderMid}`,
          background: C.bgCard, cursor: "pointer",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase",
          color: C.inkMid, transition: "all 0.15s",
        }}>
          <span style={{ fontSize: 13, lineHeight: 1 }}>
            {theme === "light" ? "○" : "●"}
          </span>
          {theme === "light" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  )
}