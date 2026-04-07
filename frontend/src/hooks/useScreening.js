import { useState, useRef, useEffect, useCallback } from "react"
import axios from "axios"
import { STEPS } from "../components/PipelineSteps"

const API = import.meta.env.VITE_API_URL || ""
const STORAGE_KEY = "skillguard_reports"

export default function useScreening() {
  const [resumes, setResumes]   = useState([])  // File[]
  const [jd, setJd]             = useState(null)
  const [status, setStatus]     = useState("idle")
  const [reports, setReports]   = useState([])   // Report[]
  const [error, setError]       = useState("")
  const [batchId, setBatchId]   = useState("")
  const [jobIds, setJobIds]     = useState([])
  const [jobStatuses, setJobStatuses] = useState({}) // { jobId: { status, report, error } }
  const [step, setStep]         = useState(0)
  const [comparison, setComparison] = useState(null)
  const [comparing, setComparing]   = useState(false)
  const [view, setView]         = useState("idle") // idle | loading | dashboard | report | compare
  const [selectedReport, setSelectedReport] = useState(null)

  const stepInterval = useRef(null)
  const pollInterval = useRef(null)

  // Load persisted reports on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.reports?.length) {
          setReports(parsed.reports)
          setView("dashboard")
        }
      }
    } catch {}
  }, [])

  // Persist reports whenever they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ reports }))
    }
  }, [reports])

  // Step animation while polling
  useEffect(() => {
    if (status !== "polling") return
    stepInterval.current = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1))
    }, 10000)
    return () => clearInterval(stepInterval.current)
  }, [status])

  function clearIntervals() {
    clearInterval(stepInterval.current)
    clearInterval(pollInterval.current)
  }

  // ── Add/remove resumes ──────────────────────────────

  const addResumes = useCallback((files) => {
    setResumes(prev => {
      const combined = [...prev, ...files]
      return combined.slice(0, 3) // max 3
    })
  }, [])

  const removeResume = useCallback((index) => {
    setResumes(prev => prev.filter((_, i) => i !== index))
  }, [])

  // ── Submit ──────────────────────────────────────────

  async function submit() {
    if (resumes.length === 0 || !jd) return
    setStatus("uploading")
    setError("")
    setStep(0)
    setJobStatuses({})
    setView("loading")

    try {
      if (resumes.length === 1) {
        // Single candidate — use original endpoint
        const form = new FormData()
        form.append("resume", resumes[0])
        form.append("jd", jd)
        const { data } = await axios.post(`${API}/screen`, form)
        setJobIds([data.job_id])
        setBatchId("")
        setStatus("polling")
        startSinglePolling(data.job_id)
      } else {
        // Batch — use batch endpoint
        const form = new FormData()
        form.append("jd", jd)
        resumes.forEach(r => form.append("resumes", r))
        const { data } = await axios.post(`${API}/screen-batch`, form)
        setBatchId(data.batch_id)
        setJobIds(data.job_ids)
        setStatus("polling")
        startBatchPolling(data.batch_id)
      }
    } catch {
      setError("Upload failed — is the backend running on port 8000?")
      setStatus("error")
      setView("idle")
    }
  }

  // ── Single polling ──────────────────────────────────

  function startSinglePolling(jobId) {
    pollInterval.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/status/${jobId}`)
        setJobStatuses({ [jobId]: data })

        if (data.status === "complete") {
          clearIntervals()
          const newReports = [data.report]
          setReports(newReports)
          setStatus("done")
          setView(newReports.length > 1 ? "dashboard" : "report")
          setSelectedReport(data.report)
        } else if (data.status === "failed") {
          clearIntervals()
          setError(data.error || "Pipeline failed")
          setStatus("error")
          setView("idle")
        }
      } catch {
        clearIntervals()
        setError("Lost connection to backend")
        setStatus("error")
        setView("idle")
      }
    }, 2500)
  }

  // ── Batch polling ───────────────────────────────────

  function startBatchPolling(bId) {
    pollInterval.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/batch/${bId}`)

        // Update per-job statuses
        const newStatuses = {}
        data.jobs.forEach(j => { newStatuses[j.job_id] = j })
        setJobStatuses(newStatuses)

        if (data.status === "complete" || data.status === "partial") {
          clearIntervals()
          const completedReports = data.jobs
            .filter(j => j.status === "complete" && j.report)
            .map(j => j.report)
          setReports(completedReports)
          setStatus("done")
          setView(completedReports.length > 1 ? "dashboard" : "report")
          if (completedReports.length === 1) setSelectedReport(completedReports[0])
        }
      } catch {
        clearIntervals()
        setError("Lost connection to backend")
        setStatus("error")
        setView("idle")
      }
    }, 2500)
  }

  // ── Comparison ──────────────────────────────────────

  async function compare(reportA, reportB) {
    setComparing(true)
    try {
      // Retrieve stored JD text from batch or upload new
      const jdText = batches_jd_text || ""
      const { data } = await axios.post(`${API}/compare`, {
        report_a: reportA,
        report_b: reportB,
        jd_text: jdText,
      })
      setComparison(data)
      setView("compare")
    } catch (e) {
      setError("Comparison failed — " + (e.message || "unknown error"))
    } finally {
      setComparing(false)
    }
  }

  // Store JD text for comparison (set after first batch/single result)
  const [jdText, setJdText] = useState("")
  const batches_jd_text = jdText

  // ── Navigation ──────────────────────────────────────

  function viewReport(report) {
    setSelectedReport(report)
    setView("report")
  }

  function backToDashboard() {
    setView("dashboard")
    setSelectedReport(null)
    setComparison(null)
  }

  function reset() {
    clearIntervals()
    setResumes([])
    setJd(null)
    setStatus("idle")
    setReports([])
    setError("")
    setBatchId("")
    setJobIds([])
    setJobStatuses({})
    setStep(0)
    setComparison(null)
    setSelectedReport(null)
    setView("idle")
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    resumes, addResumes, removeResume,
    jd, setJd,
    status, reports, error, batchId, jobIds, jobStatuses, step,
    comparison, comparing, compare,
    view, selectedReport, viewReport, backToDashboard,
    submit, reset, setJdText,
  }
}