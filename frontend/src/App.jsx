import { useState } from "react"
import GlobalStyle  from "./components/GlobalStyle"
import Header       from "./components/Header"
import IdleView     from "./views/IdleView"
import LoadingView  from "./views/LoadingView"
import ErrorView    from "./views/ErrorView"
import ReportView   from "./views/ReportView"
import DashboardView from "./views/DashboardView"
import CompareView  from "./views/CompareView"
import useScreening from "./hooks/useScreening"

export default function App() {
  const [theme, setTheme] = useState("light")

  const s = useScreening()

  // Track which two reports are being compared (for passing to CompareView)
  const [compareReports, setCompareReports] = useState({ a: null, b: null })

  function handleCompare(reportA, reportB) {
    setCompareReports({ a: reportA, b: reportB })
    s.compare(reportA, reportB)
  }

  return (
    <>
      <GlobalStyle theme={theme} />
      <Header theme={theme} onToggleTheme={() => setTheme(t => t === "light" ? "dark" : "light")} />
      <main style={{ position: "relative", zIndex: 1 }}>

        {s.view === "idle" && (
          <IdleView
            resumes={s.resumes}
            addResumes={s.addResumes}
            removeResume={s.removeResume}
            jd={s.jd}
            setJd={s.setJd}
            onSubmit={s.submit}
          />
        )}

        {s.view === "loading" && (
          <LoadingView
            status={s.status}
            step={s.step}
            jobIds={s.jobIds}
            jobStatuses={s.jobStatuses}
          />
        )}

        {s.status === "error" && (
          <ErrorView error={s.error} onReset={s.reset} />
        )}

        {s.view === "dashboard" && (
          <DashboardView
            reports={s.reports}
            onViewReport={s.viewReport}
            onCompare={handleCompare}
            comparing={s.comparing}
            onReset={s.reset}
          />
        )}

        {s.view === "report" && s.selectedReport && (
          <ReportView
            report={s.selectedReport}
            onReset={s.reset}
            onBack={s.reports.length > 1 ? s.backToDashboard : undefined}
          />
        )}

        {s.view === "compare" && s.comparison && (
          <CompareView
            comparison={s.comparison}
            reportA={compareReports.a}
            reportB={compareReports.b}
            onBack={s.backToDashboard}
          />
        )}

      </main>
    </>
  )
}