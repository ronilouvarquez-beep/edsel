'use client'

import Link from 'next/link'
import {
  Shader,
  SolidColor,
  Surface3D,
  DotGrid,
  Prism,
  LinearGradient,
  LiquidMetal,
} from 'shaders/react'

export function ConferenceHero() {
  return (
    <main
      className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-[#080808] text-white antialiased"
      style={{
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui',
      }}
    >
      {/* Shader backdrop */}
      <div
        className="absolute inset-0 z-0 block"
        aria-hidden="true"
        style={{ width: '100%', height: '100%' }}
      >
        <Shader toneMapping="aces" style={{ width: '100%', height: '100%', display: 'block' }}>
          <SolidColor color="#080808" />

          <Surface3D
            amplitude={0.31}
            cursorIntensity={0.83}
            edgePinning={0.4}
            farCutoff={0.12}
            frequency={1.8}
            height={0.31}
            highlights={6}
            lighting={29}
            lightX={-0.8}
            lightY={-0.95}
            octaves={1}
            tilt={73}
            zoom={1.1}
          >
            <DotGrid
              density={57}
              dotSize={{
                type: 'map',
                source: 'idmrf0jzpi1json7rda',
                channel: 'luminance',
                inputMin: 0,
                inputMax: 1,
                outputMin: 0,
                outputMax: 0.21,
                curve: 0.2,
              }}
              speed={0.91}
              visible={true}
            />
          </Surface3D>

          <Prism
            endFalloff={0.44}
            intensity={0.24}
            position={{ x: 1.01, y: 1.23 }}
            saturation={0.79}
            softness={0.001}
            speed={0.16}
            splitPosition={{ x: 0.99, y: 1.11 }}
            spread={3}
            startFalloff={0.64}
          />

          <LinearGradient
            id="idmrf0jzpi1json7rda"
            colorSpace="oklab"
            start={{ x: 0.5, y: 1.01 }}
            end={{ x: 0.5, y: 0.15 }}
            stops={[
              { color: '#ffffff', position: 0 },
              { color: '#000000', position: 1 },
            ]}
            visible={false}
          />

          <LiquidMetal
            center={{ x: 0.5, y: 0.45 }}
            lightColor="#1f1f1f"
            ripple={5.31}
            scale={1.17}
            shape={JSON.stringify({
              type: 'metaballs3D',
              ballRadius: 0.1,
              spread: 0.29,
              blend: 0.325,
              speed: 1,
              rotX: 0,
              rotY: 0,
              rotZ: 0,
            })}
            shapeType="metaballs3D"
            turbulence={0.37}
          />
        </Shader>
      </div>

      {/* Header */}
      <header className="animation-reveal relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <style>{`
          @keyframes reveal {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: none;
            }
          }

          @media (prefers-reduced-motion: no-preference) {
            .animation-reveal {
              animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .animation-reveal,
            .animation-reveal-100,
            .animation-reveal-200,
            .animation-reveal-300,
            .animation-reveal-400 {
              opacity: 1 !important;
              transform: none !important;
              animation: none !important;
            }
          }

          .animation-reveal-100 {
            animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
            opacity: 0;
            transform: translateY(16px);
          }

          .animation-reveal-200 {
            animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
            opacity: 0;
            transform: translateY(16px);
          }

          .animation-reveal-300 {
            animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
            opacity: 0;
            transform: translateY(16px);
          }

          .animation-reveal-400 {
            animation: reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
            opacity: 0;
            transform: translateY(16px);
          }

          @keyframes ping {
            75%,
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          .animate-ping-custom {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
        `}</style>

        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="flex size-2.5 items-center justify-center rounded-full bg-white"
              style={{
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.9)',
              }}
              aria-hidden
            />
            <span className="text-sm font-semibold tracking-tight">
              Edsel&apos;s
              <span className="ml-1.5 font-mono text-xs font-normal text-neutral-700">'26</span>
            </span>
          </Link>

          <nav
            className="hidden gap-7 text-sm text-neutral-400 md:flex"
            aria-label="Primary"
          >
            <Link
              href="#menu"
              className="transition-colors hover:text-white"
            >
              Menu
            </Link>
            <Link
              href="#reservations"
              className="transition-colors hover:text-white"
            >
              Reservations
            </Link>
            <Link
              href="#about"
              className="transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="transition-colors hover:text-white"
            >
              Contact
            </Link>
          </nav>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
        >
          Book now
        </Link>
      </header>

      {/* Hero Content */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center sm:px-6">
        {/* Badge */}
        <div className="animation-reveal-100">
          <span
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm"
            style={{
              animation: 'reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
              opacity: 0,
              transform: 'translateY(16px)',
            }}
          >
            <span className="relative flex size-1.5">
              <span
                className="animate-ping-custom absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                style={{ opacity: 0.6 }}
              />
              <span className="relative inline-flex rounded-full bg-emerald-400 size-1.5" />
            </span>
            Serbisyo ug Lami · Kapatagan, Cebu
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animation-reveal-200 mt-12 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tighter text-balance sm:text-6xl"
          style={{
            animation: 'reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
            opacity: 0,
            transform: 'translateY(16px)',
          }}
        >
          Where Every Celebration
          <br />
          <span className="text-neutral-500">Tastes Better</span>
        </h1>

        {/* Body Copy */}
        <p
          className="animation-reveal-300 mt-8 max-w-sm text-sm leading-relaxed text-neutral-400 text-balance sm:max-w-md sm:text-base"
          style={{
            animation: 'reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
            opacity: 0,
            transform: 'translateY(16px)',
          }}
        >
          Custom cakes, full catering, and event styling for birthdays, weddings, baptisms, and
          gatherings. Freshly baked in Cebu — serbisyo ug lami para sa tanan.
        </p>

        {/* CTA Row */}
        <div
          className="animation-reveal-400 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          style={{
            animation: 'reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
            opacity: 0,
            transform: 'translateY(16px)',
          }}
        >
          <Link
            href="/login"
            className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
          >
            Plan Your Event
          </Link>
          <Link
            href="/admin/menu"
            className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-white transition-colors hover:border-white/35 hover:bg-white/5"
          >
            View Our Menu
          </Link>
        </div>
      </section>
    </main>
  )
}
