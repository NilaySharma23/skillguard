import { C } from "../constants/tokens"

export default function ErrorView({ error, onReset }) {
  return (
    <div className="anim-fade-up" style={{ marginTop: 64, maxWidth: 560, padding: "0 40px", marginLeft: "auto", marginRight: "auto" }}>
      <div style={{
        background: C.bgCard,
        border: `1px solid ${C.red}33`,
        borderRadius: 12,
        padding: 28,
      }}>
        {/* Error header */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: C.redDim,
            border: `1px solid ${C.red}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.red,
          }}>!</div>
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 6,
            }}>Pipeline Failed</div>
            <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.65 }}>{error}</div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

        <button className="btn btn-ghost" style={{ width: "100%" }} onClick={onReset}>
          ← Try again
        </button>
      </div>
    </div>
  )
}