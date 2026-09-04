"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  ChevronsUpDownIcon,
  CircleUserRoundIcon,
  MoonIcon,
  MonitorIcon,
  PaletteIcon,
  RefreshCcwIcon,
  ShuffleIcon,
  SunIcon,
} from "lucide-react"

import { createClient, signOut } from "@/lib/supabase/client"
import { useTheme, type Theme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

const primaryColors = [
  "#171717", "#ff4d55", "#ff7100", "#e28b00", "#c6a400", "#78b900", "#39b64b",
  "#00b77c", "#00b3a2", "#00aebd", "#079bd7", "#4497f6", "#7585f6", "#9779f4",
  "#aa6be3", "#d258ca", "#df5ca4", "#ff5071", "#c98b5e", "#3e4248", "#34435c",
]

const grayColors = ["#464646", "#554b3e", "#454950", "#34435c", "#484c52", "#5e4a62", "#46563b", "#425b67", "#614b40", "#202b4d"]

export function SiteHeader() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [email, setEmail] = useState("Account")
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [color, setColor] = useState("#171717")
  const [radius, setRadius] = useState("0.625rem")
  const [fontSize, setFontSize] = useState("16px")

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setEmail(data.user?.email ?? "Account"))
    const savedColor = localStorage.getItem("edsel-color")
    const savedRadius = localStorage.getItem("edsel-radius")
    const savedFontSize = localStorage.getItem("edsel-font-size")
    if (savedColor) applyColor(savedColor, setColor)
    if (savedRadius) applyRadius(savedRadius, setRadius)
    if (savedFontSize) applyFontSize(savedFontSize, setFontSize)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Overview</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="relative ml-auto flex items-center gap-1">
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Notifications"><BellIcon /></Button>
            <DropdownMenu className="w-72" placement="bottom end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>No new notifications</DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>

          <Button variant="ghost" size="icon" aria-label="Toggle color mode" onPress={() => setTheme(isDark ? "light" : "dark")}>
            <MoonIcon />
          </Button>

          <Button variant="ghost" size="icon" aria-label="Customize appearance" onPress={() => setPaletteOpen(!paletteOpen)}>
            <PaletteIcon />
          </Button>

          {paletteOpen && (
            <CustomizationPanel
              color={color}
              radius={radius}
              fontSize={fontSize}
              onColorChange={(value) => applyColor(value, setColor)}
              onRadiusChange={(value) => applyRadius(value, setRadius)}
              onFontSizeChange={(value) => applyFontSize(value, setFontSize)}
              onThemeChange={(value) => setTheme(value as Theme)}
              resolvedTheme={resolvedTheme}
              onReset={() => {
                applyColor("#171717", setColor)
                applyRadius("0.625rem", setRadius)
                applyFontSize("16px", setFontSize)
                setTheme("system")
              }}
            />
          )}

          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" aria-label="Profile"><CircleUserRoundIcon /></Button>
            <DropdownMenu placement="bottom end">
              <DropdownMenuLabel>{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onAction={async () => { await signOut(); router.push("/login") }}>Sign out</DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      </div>
    </header>
  )
}

function CustomizationPanel({
  color, radius, fontSize, onColorChange, onRadiusChange, onFontSizeChange, onThemeChange, resolvedTheme, onReset,
}: {
  color: string
  radius: string
  fontSize: string
  onColorChange: (value: string) => void
  onRadiusChange: (value: string) => void
  onFontSizeChange: (value: string) => void
  onThemeChange: (value: string) => void
  resolvedTheme?: string
  onReset: () => void
}) {
  return (
    <section className="absolute top-11 right-0 z-50 w-[min(320px,calc(100vw-1.5rem))] rounded-xl border bg-background p-4 text-foreground shadow-2xl">
      <h2 className="text-xl font-semibold tracking-tight">Customize</h2>
      <p className="mt-1 text-sm text-muted-foreground">Pick a style and color for your components.</p>
      <div className="my-4 border-t" />
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Themes</h3>
      <Button variant="outline" className="h-9 w-full justify-start text-sm">
        <span className="size-5 rounded-full bg-zinc-500" /> Gray <ChevronsUpDownIcon className="ml-auto" />
      </Button>
      <div className="my-4 border-t" />
      <SwatchSection title="Primary Color" colors={primaryColors} selected={color} onSelect={onColorChange} />
      <SwatchSection title="Gray Color" colors={grayColors} selected={color} onSelect={onColorChange} />
      <RangeSection title="Radius" value={radius.replace("rem", "")} min="0" max="1.25" step="0.125" display={`${Number.parseFloat(radius).toFixed(3)}`} onChange={(value) => onRadiusChange(`${value}rem`)} />
      <RangeSection title="Font Size" value={fontSize.replace("px", "")} min="14" max="18" step="1" display={fontSize === "16px" ? "Default" : fontSize} onChange={(value) => onFontSizeChange(`${value}px`)} />
      <div className="my-4 border-t" />
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Mode</h3>
      <div className="grid grid-cols-3 gap-2">
        <ModeButton active={resolvedTheme === "system"} onPress={() => onThemeChange("system")}><MonitorIcon />System</ModeButton>
        <ModeButton active={resolvedTheme === "light"} onPress={() => onThemeChange("light")}><SunIcon />Light</ModeButton>
        <ModeButton active={resolvedTheme === "dark"} onPress={() => onThemeChange("dark")}><MoonIcon />Dark</ModeButton>
      </div>
      <div className="my-4 border-t" />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onPress={onReset}><RefreshCcwIcon />Reset</Button>
        <Button onPress={() => onColorChange(primaryColors[Math.floor(Math.random() * primaryColors.length)])}><ShuffleIcon />Shuffle</Button>
      </div>
    </section>
  )
}

function SwatchSection({ title, colors, selected, onSelect }: { title: string; colors: string[]; selected: string; onSelect: (value: string) => void }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-7 gap-2">
        {colors.map((value) => <button key={value} type="button" aria-label={`Select ${value}`} onClick={() => onSelect(value)} className={`size-6 rounded-full border-2 border-transparent ${selected === value ? "ring-3 ring-ring/40" : ""}`} style={{ backgroundColor: value }} />)}
      </div>
    </div>
  )
}

function RangeSection({ title, value, min, max, step, display, onChange }: { title: string; value: string; min: string; max: string; step: string; display: string; onChange: (value: string) => void }) {
  return <div className="mb-4"><div className="mb-1 flex justify-between text-sm font-medium text-muted-foreground"><span>{title}</span><span>{display}</span></div><input className="h-1.5 w-full accent-primary" type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} /></div>
}

function ModeButton({ active, onPress, children }: { active: boolean; onPress: () => void; children: React.ReactNode }) {
  return <Button variant={active ? "secondary" : "outline"} className="h-11 flex-col gap-0.5 px-1 text-[0.7rem]" onPress={onPress}>{children}</Button>
}

function applyColor(value: string, setValue: (value: string) => void) {
  setValue(value)
  document.documentElement.style.setProperty("--primary", value)
  document.documentElement.style.setProperty("--primary-foreground", "#ffffff")
  document.documentElement.style.setProperty("--ring", value)
  localStorage.setItem("edsel-color", value)
}

function applyRadius(value: string, setValue: (value: string) => void) {
  setValue(value)
  document.documentElement.style.setProperty("--radius", value)
  localStorage.setItem("edsel-radius", value)
}

function applyFontSize(value: string, setValue: (value: string) => void) {
  setValue(value)
  document.documentElement.style.fontSize = value
  localStorage.setItem("edsel-font-size", value)
}
