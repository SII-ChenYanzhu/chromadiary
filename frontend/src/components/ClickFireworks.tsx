import { useEffect, useRef } from 'react'

type Spark = {
  x: number; y: number
  vx: number; vy: number
  alpha: number
  size: number
  color: string
  gravity: number
}

const COLORS = [
  '#ffffff', '#ffccee', '#ffaadd', '#ff88cc',
  '#aaddff', '#88ccff', '#ccaaff', '#ffddaa',
  '#aaff88', '#ffff88', '#ff8888',
]

function burst(sparks: Spark[], x: number, y: number) {
  const count = 28 + Math.floor(Math.random() * 18)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const speed = 2.5 + Math.random() * 5.5
    sparks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      alpha: 1,
      size: 1.5 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      gravity: 0.12 + Math.random() * 0.08,
    })
  }
  // extra trailing stars
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2
    sparks.push({
      x, y,
      vx: Math.cos(angle) * (0.5 + Math.random() * 2),
      vy: Math.sin(angle) * (0.5 + Math.random() * 2),
      alpha: 0.9,
      size: 3 + Math.random() * 4,
      color: '#ffffff',
      gravity: 0.04,
    })
  }
}

export function ClickFireworks() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0, height = 0
    let rafId = 0
    const sparks: Spark[] = []

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onClick = (e: MouseEvent) => {
      burst(sparks, e.clientX, e.clientY)
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += s.gravity
        s.vx *= 0.97
        s.alpha -= 0.022

        if (s.alpha <= 0) { sparks.splice(i, 1); continue }

        ctx.save()
        ctx.globalAlpha = s.alpha
        ctx.shadowColor = s.color
        ctx.shadowBlur = s.size * 2.5
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      rafId = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('click', onClick)
    rafId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
