"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    return (localStorage.getItem("theme") as Theme | null) ?? "system"
  })
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"
    const storedTheme = (localStorage.getItem("theme") as Theme | null) ?? "system"
    return storedTheme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : storedTheme
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const applyTheme = (selectedTheme: Theme) => {
      const nextResolvedTheme = selectedTheme === "system"
        ? (mediaQuery.matches ? "dark" : "light")
        : selectedTheme
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark")
      setResolvedTheme(nextResolvedTheme)
    }

    applyTheme(theme)
    const handleSystemThemeChange = () => {
      if (theme === "system") applyTheme("system")
    }
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }, [theme])

  function setTheme(nextTheme: Theme) {
    localStorage.setItem("theme", nextTheme)
    setThemeState(nextTheme)
    const nextResolvedTheme = nextTheme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : nextTheme
    document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark")
    setResolvedTheme(nextResolvedTheme)
  }

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
