'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
  life: number
  maxLife: number
  color: string
}

export function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Color palette - warm tones similar to your brand
    const colors = [
      'rgba(232, 168, 124, 0.4)',  // #e8a87c - your brand color
      'rgba(255, 200, 150, 0.3)',  // lighter orange
      'rgba(200, 150, 100, 0.3)',  // darker tone
      'rgba(255, 220, 180, 0.25)', // warm white
      'rgba(220, 180, 140, 0.3)',  // mid tone
    ]

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseRef.current = { x: mouseRef.current.x, y: mouseRef.current.y }
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // Calculate distance moved
      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Create more particles for smoother trails
      const particleCount = Math.min(Math.ceil(distance / 2.5), 12)
      
      for (let i = 0; i < particleCount; i++) {
        // Create angle towards movement direction
        const moveAngle = Math.atan2(dy, dx)
        const angle = moveAngle + (Math.random() - 0.5) * Math.PI * 0.8
        
        const velocity = Math.random() * 1.2 + 0.6
        const maxLife = Math.random() * 100 + 80
        
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: Math.cos(angle) * velocity + dx * 0.12,
          vy: Math.sin(angle) * velocity + dy * 0.12,
          alpha: Math.random() * 0.5 + 0.25,
          size: Math.random() * 60 + 30,
          life: 0,
          maxLife: maxLife,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      // Fade background very slowly for smooth trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const particle = particlesRef.current[i]

        // Update life
        particle.life++
        const lifeRatio = particle.life / particle.maxLife

        // Update position with physics
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Add upward drift
        particle.vy -= 0.08
        
        // Air resistance - less drag for smoother flow
        particle.vx *= 0.94
        particle.vy *= 0.94

        // Calculate alpha - smooth fade cycle
        let currentAlpha = particle.alpha
        if (lifeRatio < 0.15) {
          currentAlpha = particle.alpha * (lifeRatio / 0.15)
        } else if (lifeRatio > 0.75) {
          currentAlpha = particle.alpha * (1 - (lifeRatio - 0.75) / 0.25)
        }

        // Draw particle
        if (particle.life < particle.maxLife) {
          ctx.save()
          
          // Use colored smoke with proper alpha blending
          const rgbaMatch = particle.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/)
          if (rgbaMatch) {
            const r = rgbaMatch[1]
            const g = rgbaMatch[2]
            const b = rgbaMatch[3]
            
            // Create radial gradient for smooth blending
            const gradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size
            )
            
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.6})`)
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${currentAlpha * 0.3})`)
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
          }
          
          ctx.restore()
        } else {
          // Remove dead particles
          particlesRef.current.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 opacity-60"
    />
  )
}
