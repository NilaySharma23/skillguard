import { C } from "../constants/tokens"

export default function ScoreRing({ score, size = 120 }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  // Use CSS variables for score color too
  const color = score >= 70 ? C.green : score >= 50 ? C.amber : C.red

  return (
    <div style={{ flexShrink: 0 }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <style>{`.ring-fill { --circ: ${circ}px; --offset: ${offset}px; }`}</style>
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r}
          fill="none" stroke={C.border} strokeWidth={stroke} />
        {/* Animated fill — glow lives on the stroke only */}
        <circle
          className="ring-fill"
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          filter="url(#ring-glow)"
        />
        <text x="50%" y="44%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: 28, fontWeight: 800, fill: color, fontFamily: "'Syne', sans-serif" }}>
          {score}
        </text>
        <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle"
          style={{ fontSize: 8, fill: C.inkDim, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}>
          MATCH
        </text>
      </svg>
    </div>
  )
}