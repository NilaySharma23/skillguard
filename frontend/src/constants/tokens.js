// C object now returns CSS variable references
// Components use these exactly like before — nothing else changes
export const C = {
  bg:           "var(--sg-bg)",
  bgPanel:      "var(--sg-bg-panel)",
  bgCard:       "var(--sg-bg-card)",
  bgCardHover:  "var(--sg-bg-card-hover)",
  bgInput:      "var(--sg-bg-input)",

  border:       "var(--sg-border)",
  borderMid:    "var(--sg-border-mid)",
  borderStrong: "var(--sg-border-strong)",

  ink:          "var(--sg-ink)",
  inkMid:       "var(--sg-ink-mid)",
  inkDim:       "var(--sg-ink-dim)",

  accent:       "var(--sg-accent)",
  accentDim:    "var(--sg-accent-dim)",
  accentMid:    "var(--sg-accent-mid)",
  accentGlow:   "var(--sg-accent-glow)",

  red:          "var(--sg-red)",
  redDim:       "var(--sg-red-dim)",
  amber:        "var(--sg-amber)",
  amberDim:     "var(--sg-amber-dim)",
  green:        "var(--sg-green)",
  greenDim:     "var(--sg-green-dim)",
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

/* ── Light theme ───────────────────────────────── */
[data-theme="light"] {
  --sg-bg:            #F4F4F5;
  --sg-bg-panel:      #FFFFFF;
  --sg-bg-card:       #FFFFFF;
  --sg-bg-card-hover: #F9F9FA;
  --sg-bg-input:      #EFEFEF;

  --sg-border:        #E4E4E7;
  --sg-border-mid:    #D1D1D6;
  --sg-border-strong: #A1A1AA;

  --sg-ink:           #09090B;
  --sg-ink-mid:       #52525B;
  --sg-ink-dim:       #A1A1AA;

  --sg-accent:        #16A34A;
  --sg-accent-dim:    #16A34A18;
  --sg-accent-mid:    #16A34A30;
  --sg-accent-glow:   0 0 20px #16A34A28;

  --sg-red:           #DC2626;
  --sg-red-dim:       #DC262612;
  --sg-amber:         #D97706;
  --sg-amber-dim:     #D9770612;
  --sg-green:         #16A34A;
  --sg-green-dim:     #16A34A12;

  --sg-btn-accent-text: #FFFFFF;
  --sg-card-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --sg-noise-opacity: 0;
}

/* ── Dark theme ────────────────────────────────── */
[data-theme="dark"] {
  --sg-bg:            #0A0A0B;
  --sg-bg-panel:      #111114;
  --sg-bg-card:       #16161A;
  --sg-bg-card-hover: #1C1C22;
  --sg-bg-input:      #0F0F12;

  --sg-border:        rgba(255,255,255,0.06);
  --sg-border-mid:    rgba(255,255,255,0.10);
  --sg-border-strong: rgba(255,255,255,0.18);

  --sg-ink:           #FFFFFF;
  --sg-ink-mid:       #A1A1AA;
  --sg-ink-dim:       #52525B;

  --sg-accent:        #00FF88;
  --sg-accent-dim:    rgba(0,255,136,0.12);
  --sg-accent-mid:    rgba(0,255,136,0.25);
  --sg-accent-glow:   0 0 24px rgba(0,255,136,0.20);

  --sg-red:           #FF4444;
  --sg-red-dim:       rgba(255,68,68,0.10);
  --sg-amber:         #FFAA00;
  --sg-amber-dim:     rgba(255,170,0,0.10);
  --sg-green:         #00FF88;
  --sg-green-dim:     rgba(0,255,136,0.10);

  --sg-btn-accent-text: #000000;
  --sg-card-shadow: none;
  --sg-noise-opacity: 0.6;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }

body {
  font-family: 'IBM Plex Sans', sans-serif;
  background: var(--sg-bg);
  color: var(--sg-ink);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  overflow-x: hidden;
  transition: background 0.25s ease, color 0.25s ease;
}

/* Noise overlay — only visible in dark mode via --sg-noise-opacity */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 0;
  opacity: var(--sg-noise-opacity);
  transition: opacity 0.25s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Syne', sans-serif;
  color: var(--sg-ink);
  font-weight: 700;
}

/* ── Animations ─────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 var(--sg-accent); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 5px transparent; }
}
@keyframes scanLine {
  0%   { top: 0; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.scan-line { animation: scanLine 3s ease-in-out infinite; }
@keyframes drawRing {
  from { stroke-dashoffset: var(--circ); }
  to   { stroke-dashoffset: var(--offset); }
}

.anim-fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-fade-in { animation: fadeIn 0.3s ease both; }
.anim-d1 { animation-delay: 0.05s; } .anim-d2 { animation-delay: 0.10s; }
.anim-d3 { animation-delay: 0.15s; } .anim-d4 { animation-delay: 0.20s; }
.anim-d5 { animation-delay: 0.25s; } .anim-d6 { animation-delay: 0.30s; }

/* ── Utilities ──────────────────────────────────── */
.spinner {
  width: 16px; height: 16px;
  border: 1.5px solid var(--sg-border-mid);
  border-top-color: var(--sg-accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.pulse-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--sg-accent);
  animation: pulse-dot 1.4s ease infinite;
  flex-shrink: 0;
}
.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--sg-ink-dim);
}
.tag {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase;
}

/* ── Card ───────────────────────────────────────── */
.card {
  background: var(--sg-bg-card);
  border: 1px solid var(--sg-border);
  border-radius: 12px; overflow: hidden;
  box-shadow: var(--sg-card-shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.card:hover { border-color: var(--sg-border-mid); }

.hr { height: 1px; background: var(--sg-border); }

/* ── Layout ─────────────────────────────────────── */
.container {
  width: 100%; max-width: 1100px;
  margin: 0 auto; padding: 0 40px;
}

/* ── Dropzone ───────────────────────────────────── */
.dz {
  border: 1px dashed var(--sg-border-strong);
  border-radius: 10px; padding: 28px 20px;
  text-align: center; cursor: pointer;
  transition: all 0.18s;
  background: var(--sg-bg-input);
  user-select: none;
}
.dz:hover { background: var(--sg-bg-card-hover); }
.dz.dz-active { border-color: var(--sg-accent); border-style: solid; background: var(--sg-accent-dim); }
.dz.dz-filled { border-color: var(--sg-accent); border-style: solid; }

/* ── Buttons ────────────────────────────────────── */
.btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 24px; border-radius: 8px; border: none;
  font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.15s ease; letter-spacing: 0.01em;
}
.btn-accent {
  background: var(--sg-accent);
  color: var(--sg-btn-accent-text);
}
.btn-accent:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--sg-accent-glow);
}
.btn-accent:disabled {
  background: var(--sg-border-mid);
  color: var(--sg-ink-dim); cursor: not-allowed;
}
.btn-ghost {
  background: transparent; color: var(--sg-ink-mid);
  border: 1px solid var(--sg-border-mid);
}
.btn-ghost:hover { border-color: var(--sg-border-strong); color: var(--sg-ink); }

/* ── Score ring ─────────────────────────────────── */
.ring-fill { animation: drawRing 1.4s cubic-bezier(0.22,1,0.36,1) 0.4s both; }

/* ── Interview question rows ────────────────────── */
.iq-row { display: flex; gap: 20px; align-items: flex-start; padding: 18px 0; }
.iq-row + .iq-row { border-top: 1px solid var(--sg-border); }

/* ── Scrollbar ──────────────────────────────────── */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--sg-border-mid); border-radius: 99px; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .split-layout { flex-direction: column !important; }
  .split-left, .split-right { width: 100% !important; }
  .split-right { border-left: none !important; border-top: 1px solid var(--sg-border) !important; }
  .container { padding: 0 16px; }
  .stats-bar { flex-direction: column; }
  .stats-bar > div { border-right: none !important; border-bottom: 1px solid var(--sg-border); }
}
`