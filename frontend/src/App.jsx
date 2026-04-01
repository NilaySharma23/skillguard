// frontend/src/App.jsx

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || ""

// ── small reusable components ──────────────────────────────────────────────

function Badge({ children, color = "gray" }) {
  const colors = {
    green:  { background: "#eaf3de", color: "#3b6d11" },
    red:    { background: "#fcebeb", color: "#a32d2d" },
    amber:  { background: "#faeeda", color: "#854f0b" },
    blue:   { background: "#e6f1fb", color: "#185fa5" },
    gray:   { background: "#f1efe8", color: "#5f5e5a" },
  }
  return (
    <span style={{
      ...colors[color],
      padding: "2px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {children}
    </span>
  )
}

function ScoreRing({ score }) {
  const color = score >= 70 ? "#1d9e75" : score >= 50 ? "#ba7517" : "#a32d2d"
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        border: `6px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 8px",
      }}>
        <span style={{ fontSize: 28, fontWeight: 500, color }}>{score}</span>
      </div>
      <span style={{ fontSize: 12, color: "#888780" }}>match score</span>
    </div>
  )
}

function DropZone({ label, onFile, file }) {
  const onDrop = useCallback(accepted => { if (accepted[0]) onFile(accepted[0]) }, [onFile])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 1
  })
  return (
    <div {...getRootProps()} style={{
      border: `2px dashed ${isDragActive ? "#1d9e75" : "#d3d1c7"}`,
      borderRadius: 12, padding: "24px 16px", textAlign: "center",
      cursor: "pointer", transition: "border-color 0.2s",
      background: isDragActive ? "#e1f5ee" : "transparent",
    }}>
      <input {...getInputProps()} />
      <div style={{ fontSize: 13, color: "#5f5e5a" }}>
        {file
          ? <><span style={{ color: "#1d9e75", fontWeight: 500 }}>✓ {file.name}</span></>
          : <>{isDragActive ? "Drop it here" : <><strong>{label}</strong><br />drag & drop or click</>}</>
        }
      </div>
    </div>
  )
}

// ── main app ───────────────────────────────────────────────────────────────

export default function App() {
  const [resume, setResume] = useState(null)
  const [jd, setJd] = useState(null)
  const [status, setStatus] = useState("idle") // idle | uploading | polling | done | error
  const [report, setReport] = useState(null)
  const [error, setError] = useState("")
  const [jobId, setJobId] = useState("")

  async function handleSubmit() {
    if (!resume || !jd) return
    setStatus("uploading")
    setError("")

    try {
      const form = new FormData()
      form.append("resume", resume)
      form.append("jd", jd)

      const { data } = await axios.post(`${API}/screen`, form)
      setJobId(data.job_id)
      setStatus("polling")
      pollStatus(data.job_id)
    } catch (e) {
      setError("Upload failed. Is the backend running?")
      setStatus("error")
    }
  }

  function pollStatus(id) {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/status/${id}`)
        if (data.status === "complete") {
          clearInterval(interval)
          setReport(data.report)
          setStatus("done")
        } else if (data.status === "failed") {
          clearInterval(interval)
          setError(data.error || "Pipeline failed")
          setStatus("error")
        }
      } catch {
        clearInterval(interval)
        setError("Lost connection to backend")
        setStatus("error")
      }
    }, 2500)
  }

  function reset() {
    setResume(null); setJd(null)
    setStatus("idle"); setReport(null)
    setError(""); setJobId("")
  }

  const recColor = { strong_yes: "green", yes: "green", maybe: "amber", no: "red" }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4ef", fontFamily: "system-ui, sans-serif" }}>

      {/* header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e6df", padding: "16px 32px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, background: "#1d9e75", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>S</span>
        </div>
        <span style={{ fontWeight: 500, fontSize: 18 }}>SkillGuard AI</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#888780" }}>hiring intelligence</span>
      </div>

      <div style={{ maxWidth: 720, margin: "48px auto", padding: "0 24px" }}>

        {/* upload card */}
        {status === "idle" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #e8e6df" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 500 }}>Screen a candidate</h1>
            <p style={{ margin: "0 0 28px", color: "#888780", fontSize: 14 }}>
              Upload a resume and job description — get a verified, scored report in under 60 seconds.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <DropZone label="Resume PDF" onFile={setResume} file={resume} />
              <DropZone label="Job Description PDF" onFile={setJd} file={jd} />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!resume || !jd}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
                background: resume && jd ? "#1d9e75" : "#d3d1c7",
                color: resume && jd ? "#fff" : "#888780",
                fontSize: 15, fontWeight: 500, cursor: resume && jd ? "pointer" : "not-allowed",
                transition: "background 0.2s",
              }}
            >
              Run screening pipeline
            </button>
          </div>
        )}

        {/* loading state */}
        {(status === "uploading" || status === "polling") && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", border: "1px solid #e8e6df" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>⚙</div>
            <p style={{ fontWeight: 500, marginBottom: 8 }}>
              {status === "uploading" ? "Uploading files..." : "Running 4-agent pipeline..."}
            </p>
            <p style={{ color: "#888780", fontSize: 13, margin: 0 }}>
              {status === "polling" && `Job ${jobId} · Agents running: Parser → Verifier → Critic → Reporter`}
            </p>
          </div>
        )}

        {/* error state */}
        {status === "error" && (
          <div style={{ background: "#fcebeb", borderRadius: 16, padding: 32, border: "1px solid #f7c1c1" }}>
            <p style={{ color: "#a32d2d", fontWeight: 500, margin: "0 0 16px" }}>Pipeline failed</p>
            <p style={{ color: "#a32d2d", fontSize: 13, margin: "0 0 20px" }}>{error}</p>
            <button onClick={reset} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #f7c1c1", background: "#fff", cursor: "pointer", color: "#a32d2d" }}>
              Try again
            </button>
          </div>
        )}

        {/* report */}
        {status === "done" && report && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* top card */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #e8e6df" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
                <ScoreRing score={report.match_score} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500 }}>{report.candidate_name}</h2>
                    <Badge color={recColor[report.hiring_recommendation] || "gray"}>
                      {report.hiring_recommendation?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p style={{ margin: 0, color: "#5f5e5a", fontSize: 14, lineHeight: 1.6 }}>{report.summary}</p>
                </div>
              </div>
            </div>

            {/* strengths + risks */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e6df" }}>
                <p style={{ margin: "0 0 14px", fontWeight: 500, fontSize: 14 }}>Verified strengths</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.verified_strengths?.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#3b6d11", display: "flex", gap: 8 }}>
                      <span>✓</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e6df" }}>
                <p style={{ margin: "0 0 14px", fontWeight: 500, fontSize: 14 }}>Risk flags</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {report.risk_flags?.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#a32d2d", display: "flex", gap: 8 }}>
                      <span>⚠</span><span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* interview questions */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e6df" }}>
              <p style={{ margin: "0 0 16px", fontWeight: 500, fontSize: 14 }}>Recommended interview questions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {report.recommended_interview_questions?.map((q, i) => (
                  <div key={i} style={{ borderLeft: "3px solid #9fe1cb", paddingLeft: 14 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 500 }}>{q.question}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888780" }}>targets: {q.targets}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* match reasoning */}
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e6df" }}>
              <p style={{ margin: "0 0 10px", fontWeight: 500, fontSize: 14 }}>Match reasoning</p>
              <p style={{ margin: 0, fontSize: 13, color: "#5f5e5a", lineHeight: 1.7 }}>{report.match_reasoning}</p>
            </div>

            <button onClick={reset} style={{
              padding: "12px 0", borderRadius: 8, border: "1px solid #d3d1c7",
              background: "#fff", cursor: "pointer", fontSize: 14, color: "#5f5e5a"
            }}>
              Screen another candidate
            </button>
          </div>
        )}

      </div>
    </div>
  )
}