"use client"

import Link from "next/link"
import { useSyncExternalStore } from "react"
import { ArrowLeftIcon, MoonIcon, SunIcon } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { useTheme } from "@/components/theme-provider"

export default function Page() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div className="login-grid-background relative flex min-h-svh w-full items-center justify-center overflow-hidden p-6 md:p-10">
      <div className="login-grid-lines" aria-hidden="true">
        <span className="login-grid-light login-grid-light-one" />
        <span className="login-grid-light login-grid-light-two" />
        <span className="login-grid-light login-grid-light-three" />
      </div>
      <Link
        href="/"
        className="absolute top-5 left-5 flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Back to landing page"
        title="Back to landing page"
      >
        <ArrowLeftIcon className="size-4" />
      </Link>
      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      </button>
      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
