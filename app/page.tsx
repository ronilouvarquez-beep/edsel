import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BabyIcon,
  CakeSliceIcon,
  CalendarDaysIcon,
  ChurchIcon,
  Flower2Icon,
  HeartIcon,
  PaletteIcon,
  PartyPopperIcon,
  SparklesIcon,
  TruckIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from "lucide-react"

const occasions = [
  {
    id: "birthday",
    number: "01",
    title: "Birthdays",
    text: "Custom cakes, dessert tables, and party catering that make the wish feel bigger than the candles.",
    includes: ["Theme cakes", "Party platters", "Dessert bars"],
    icon: PartyPopperIcon,
  },
  {
    id: "wedding",
    number: "02",
    title: "Weddings",
    text: "Reception menus and multi-tier cakes styled to the day — from intimate vows to a full celebration.",
    includes: ["Tiered cakes", "Reception catering", "Styling"],
    icon: HeartIcon,
  },
  {
    id: "baptism",
    number: "03",
    title: "Baptisms",
    text: "Soft, elegant spreads for family after the ceremony — cakes, merienda, and thoughtful details.",
    includes: ["Christening cakes", "Family merienda", "Souvenir treats"],
    icon: ChurchIcon,
  },
  {
    id: "gathering",
    number: "04",
    title: "Gatherings",
    text: "Reunions, office lunch, and house celebrations with generous tables meant to be shared.",
    includes: ["Buffet packages", "Share platters", "On-site service"],
    icon: UsersIcon,
  },
] as const

const services = [
  {
    title: "Custom cakes",
    text: "Sculpted, layered, and flavored for the people at the table — from classic ube to modern finishes.",
    icon: CakeSliceIcon,
  },
  {
    title: "Full catering",
    text: "Plated or buffet menus for intimate rooms and big halls, planned around your guest count and timing.",
    icon: UtensilsCrossedIcon,
  },
  {
    title: "Dessert tables",
    text: "Cakes, pastries, and sweets styled as a centerpiece guests actually want to gather around.",
    icon: SparklesIcon,
  },
  {
    title: "Event design",
    text: "Color, florals, and table details that match the occasion so the food and the room feel like one story.",
    icon: PaletteIcon,
  },
  {
    title: "Cebu delivery",
    text: "Fresh from the kitchen to your venue, with setup support when the celebration needs a full table.",
    icon: TruckIcon,
  },
  {
    title: "Tasting & planning",
    text: "Walk through flavors, headcount, and timeline with us before the day — so nothing is left guessing.",
    icon: CalendarDaysIcon,
  },
]

const designs = [
  {
    occasion: "Birthday",
    look: "Playful and personal",
    text: "Bold colors, character toppers, or a clean modern drip — designed around the guest of honor.",
    palette: ["#f4b4c4", "#f2d28a", "#f4f2ed"],
    icon: PartyPopperIcon,
  },
  {
    occasion: "Wedding",
    look: "Quiet luxury",
    text: "Ivory tiers, sugar florals, and a reception table that photographs as well as it tastes.",
    palette: ["#f7f1e8", "#d4c4b0", "#aa4c34"],
    icon: Flower2Icon,
  },
  {
    occasion: "Baptism",
    look: "Soft and sacred",
    text: "Ivory, gold, and gentle florals for a family table that feels calm after the ceremony.",
    palette: ["#f4f0e6", "#c9b896", "#8a9bb5"],
    icon: BabyIcon,
  },
  {
    occasion: "Gathering",
    look: "Abundant and warm",
    text: "Shareable platters, rustic-modern serving, and a table that looks full the moment guests arrive.",
    palette: ["#e8d5b5", "#aa4c34", "#2a2118"],
    icon: UsersIcon,
  },
]

const steps = [
  { number: "01", title: "Share the occasion", text: "Tell us the date, guest count, and the feeling you want in the room." },
  { number: "02", title: "Taste and design", text: "We shape the cake, menu, and table styling until it fits the day." },
  { number: "03", title: "We serve the moment", text: "Fresh bake, on-time setup, and a table ready when your people arrive." },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[13px] font-semibold tracking-tight text-black">
              E
            </span>
            <span className="text-sm font-medium tracking-tight">Edsel&apos;s</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a href="#occasions" className="transition-colors hover:text-white">Occasions</a>
            <a href="#services" className="transition-colors hover:text-white">Services</a>
            <a href="#design" className="transition-colors hover:text-white">Design</a>
            <Link href="/admin/menu" className="transition-colors hover:text-white">Menu</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white sm:inline">
              Sign in
            </Link>
            <Link
              href="/admin/reservations"
              className="inline-flex h-8 items-center rounded-full bg-white px-3.5 text-sm font-medium text-black transition-opacity hover:opacity-80"
            >
              Book now
            </Link>
          </div>
        </div>
        <nav className="flex items-center justify-center gap-5 border-t border-white/10 px-4 py-2 text-xs text-white/60 md:hidden">
          <a href="#occasions" className="hover:text-white">Occasions</a>
          <a href="#services" className="hover:text-white">Services</a>
          <a href="#design" className="hover:text-white">Design</a>
          <Link href="/admin/menu" className="hover:text-white">Menu</Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32 lg:pb-28 lg:pt-36">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            <SparklesIcon className="size-3.5 text-[#e8a87c]" />
            Cake shop &amp; catering · Kapatagan
          </p>
          <h1 className="text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            Serbisyo ug Lami
            <br />
            <span className="text-white/45">Para sa Tanan.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            Cakes and full catering for birthdays, weddings, baptisms, and gatherings — designed for the people and the moment.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/admin/reservations"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-80"
            >
              Plan your celebration
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/admin/menu"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/10"
            >
              Explore the menu
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-xs font-medium uppercase tracking-[0.18em] text-white/35 sm:px-6">
          <span>Birthday</span>
          <span>Wedding</span>
          <span>Baptism</span>
          <span>Gathering</span>
        </div>
      </section>

      <section id="occasions" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-[#e8a87c]">What&apos;s for your occasion?</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Every celebration, one kitchen.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/50">
            From the first slice to the last platter, we build the table around the day you&apos;re actually hosting.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {occasions.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.id} className="group bg-black p-6 transition-colors hover:bg-[#0a0a0a] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-[family-name:var(--font-geist-mono)] text-xs text-white/35">{item.number}</span>
                  <Icon className="size-5 text-white/40 transition-colors group-hover:text-[#e8a87c]" />
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">{item.text}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {item.includes.map((extra) => (
                    <li key={extra} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60">
                      {extra}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      <section id="services" className="border-y border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium text-[#e8a87c]">What&apos;s included</p>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Services for the whole table.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/45">
              Cake, catering, styling, and service — so you are not stitching the day together from five different places.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="bg-[#0a0a0a] p-6 sm:p-7">
                  <Icon className="size-5 text-white/70" />
                  <h3 className="mt-8 text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="design" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-[#e8a87c]">The look of the day</p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Designed for the moment.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/50">
            Each occasion has its own design language — cake finish, color story, and table styling that belong together.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {designs.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.occasion} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-[#e8a87c]" />
                    <h3 className="text-lg font-semibold tracking-tight">{item.occasion}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.palette.map((color) => (
                      <span key={color} className="size-3.5 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <p className="mt-6 text-sm font-medium text-white/80">{item.look}</p>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto grid max-w-6xl gap-px bg-white/10 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="bg-black px-6 py-12 sm:px-8">
              <span className="font-[family-name:var(--font-geist-mono)] text-xs text-white/35">{step.number}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Tell us the occasion.
          <br />
          <span className="text-white/40">We&apos;ll bring the good part.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/50">
          Book a tasting, reserve a date, or start with the menu. Freshly baked in Cebu — serbisyo ug lami para sa tanan.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/reservations"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-80"
          >
            Make a reservation
            <ArrowUpRightIcon className="size-4" />
          </Link>
          <Link
            href="/admin/menu"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/30"
          >
            See cakes &amp; packages
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-black">E</span>
              <span className="text-sm font-medium">Edsel&apos;s</span>
            </div>
            <p className="mt-4 max-w-[16rem] text-sm leading-6 text-white/40">
              Edsel&apos;s Cake Shop &amp; Catering Services. Made in Cebu for every table.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Occasions</p>
            <ul className="mt-4 space-y-2 text-sm text-white/45">
              <li><a href="#occasions" className="hover:text-white">Birthday</a></li>
              <li><a href="#occasions" className="hover:text-white">Wedding</a></li>
              <li><a href="#occasions" className="hover:text-white">Baptism</a></li>
              <li><a href="#occasions" className="hover:text-white">Gathering</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Services</p>
            <ul className="mt-4 space-y-2 text-sm text-white/45">
              <li><Link href="/admin/menu" className="hover:text-white">Menu</Link></li>
              <li><a href="#services" className="hover:text-white">Catering</a></li>
              <li><a href="#design" className="hover:text-white">Cake design</a></li>
              <li><Link href="/admin/reservations" className="hover:text-white">Reservations</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Visit</p>
            <ul className="mt-4 space-y-2 text-sm text-white/45">
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              <li><a href="https://instagram.com" className="hover:text-white">Instagram</a></li>
              <li>Cebu, Philippines</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/10 px-4 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Edsel&apos;s Cake Shop &amp; Catering Services</span>
          <span>Serbisyo ug Lami Para sa Tanan</span>
        </div>
      </footer>
    </main>
  )
}
