import { createContext, useContext, useState, useEffect } from "react"
import { DARK, LIGHT, buildCSS } from "../constants/tokens"

const ThemeContext = createContext(DARK)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true)
  const t = isDark ? DARK : LIGHT

  useEffect(() => {
    let el = document.getElementById("sg-theme-css")
    if (!el) {
      el = document.createElement("style")
      el.id = "sg-theme-css"
      document.head.appendChild(el)
    }
    el.textContent = buildCSS(t)
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ t, isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)