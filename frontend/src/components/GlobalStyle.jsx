import { useEffect } from "react"
import { CSS } from "../constants/tokens"

export default function GlobalStyle({ theme }) {
  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style")
    el.id = "sg-global-style"
    el.textContent = CSS
    document.head.appendChild(el)
    return () => el.remove()
  }, [])

  // Swap data-theme on html element whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return null
}