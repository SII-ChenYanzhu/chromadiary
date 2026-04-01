import { useEffect, useRef } from 'react'
import type { ThemeId } from '../theme/themes'

// ─── Intensity Mode ────────────────────────────────────────────────────────────
export type IntensityMode = 'subtle' | 'balanced' | 'vivid' | 'debug'

type Props = {
  theme: ThemeId
  intensity?: IntensityMode
}

// ─── Value Noise ───────────────────────────────────────────────────────────────
function smoothstep(t: number) { return t * t * (3 - 2 * t) }
function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}
function valueNoise(x: number, y: number) {
  const ix = Math.floor(x), iy = Math.floor(y)
  const fx = x - ix, fy = y - iy
  const ux = smoothstep(fx), uy = smoothstep(fy)
  const a = hash(ix, iy), b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (b - a + a - b - c + d) * ux * uy
}
function fbm(x: number, y: number, octaves = 4) {
  let val = 0, amp = 0.5, freq = 1
  for (let i = 0; i < octaves; i++) {
    val += valueNoise(x * freq, y * freq) * amp
    amp *= 0.5; freq *= 2
  }
  return val
}

// ─── Intensity multipliers ─────────────────────────────────────────────────────
const INTENSITY_CONFIG = {
  subtle:   { particleMult: 0.5, speedMult: 0.5, glowMult: 0.4, auroraAlpha: 0.5, orbAlpha: 0.6, trailLen: 4,  orbRadius: 0.7, flowSpeed: 0.5 },
  balanced: { particleMult: 1.0, speedMult: 1.0, glowMult: 1.0, auroraAlpha: 1.0, orbAlpha: 1.0, trailLen: 8,  orbRadius: 1.0, flowSpeed: 1.0 },
  vivid:    { particleMult: 1.8, speedMult: 2.5, glowMult: 1.8, auroraAlpha: 1.5, orbAlpha: 1.4, trailLen: 14, orbRadius: 1.5, flowSpeed: 2.0 },
  debug:    { particleMult: 3.0, speedMult: 5.0, glowMult: 2.5, auroraAlpha: 2.0, orbAlpha: 2.0, trailLen: 20, orbRadius: 2.0, flowSpeed: 4.0 },
}

// ─── Theme Configs ─────────────────────────────────────────────────────────────
type ThemeConfig = {
  bgGradient: [string, string, string]
  isDark: boolean
  orbs: { color: string; glow: string; baseAlpha: number }[]
  aurora: { color: string; alpha: number }[]
  particles: {
    colors: string[]
    count: number
    shape: 'star' | 'dot' | 'petal' | 'diamond' | 'cross' | 'circle'
    glow: boolean
    size: [number, number]
    speed: number
  }
  flowColor?: string
  rays?: boolean
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  dreamy: {
    bgGradient: ['#f0d0ff', '#b8deff', '#fff0b0'],
    isDark: false,
    orbs: [
      { color: 'rgba(255,130,200,1)', glow: 'rgba(255,100,190,0.7)', baseAlpha: 0.85 },
      { color: 'rgba(110,185,255,1)', glow: 'rgba(90,175,255,0.65)', baseAlpha: 0.80 },
      { color: 'rgba(255,210,70,1)',  glow: 'rgba(255,200,50,0.60)',  baseAlpha: 0.72 },
    ],
    aurora: [
      { color: 'rgba(255,120,210,1)', alpha: 0.50 },
      { color: 'rgba(140,200,255,1)', alpha: 0.45 },
      { color: 'rgba(255,225,100,1)', alpha: 0.38 },
    ],
    particles: {
      colors: ['#ffffff','#ffccee','#cce8ff','#fff0a0','#ffaadd','#aaddff'],
      count: 250, shape: 'star', glow: true, size: [2, 6], speed: 0.9,
    },
  },
  garden: {
    bgGradient: ['#a8e8c0', '#f5ede0', '#f5c8d8'],
    isDark: false,
    orbs: [
      { color: 'rgba(80,200,130,1)',  glow: 'rgba(60,190,115,0.65)', baseAlpha: 0.82 },
      { color: 'rgba(255,185,90,1)',  glow: 'rgba(255,170,70,0.60)', baseAlpha: 0.78 },
      { color: 'rgba(255,140,170,1)', glow: 'rgba(255,125,155,0.55)', baseAlpha: 0.75 },
    ],
    aurora: [
      { color: 'rgba(80,200,130,1)',  alpha: 0.45 },
      { color: 'rgba(255,180,80,1)',  alpha: 0.38 },
      { color: 'rgba(255,140,170,1)', alpha: 0.35 },
    ],
    particles: {
      colors: ['#ffffff','#aaffd0','#ffd0e0','#ffe8a0','#d0ffea','#ffb8cc'],
      count: 200, shape: 'petal', glow: false, size: [3, 8], speed: 0.7,
    },
    flowColor: 'rgba(80,200,130,0.22)',
  },
  berry: {
    bgGradient: ['#220e38', '#350e50', '#101840'],
    isDark: true,
    orbs: [
      { color: 'rgba(200,60,255,1)',  glow: 'rgba(190,40,255,0.75)', baseAlpha: 0.88 },
      { color: 'rgba(255,60,155,1)',  glow: 'rgba(255,40,145,0.70)', baseAlpha: 0.82 },
      { color: 'rgba(70,130,255,1)',  glow: 'rgba(50,120,255,0.62)', baseAlpha: 0.75 },
    ],
    aurora: [
      { color: 'rgba(200,60,255,1)',  alpha: 0.60 },
      { color: 'rgba(255,60,155,1)',  alpha: 0.52 },
      { color: 'rgba(70,130,255,1)',  alpha: 0.42 },
    ],
    particles: {
      colors: ['#ffffff','#ee99ff','#ff88cc','#99aaff','#ffaaee','#ccaaff'],
      count: 300, shape: 'diamond', glow: true, size: [1.5, 5], speed: 1.1,
    },
    rays: true,
  },
  ocean: {
    bgGradient: ['#90d8ff', '#e8f8ff', '#ffd8b8'],
    isDark: false,
    orbs: [
      { color: 'rgba(40,175,255,1)',  glow: 'rgba(20,165,255,0.68)', baseAlpha: 0.85 },
      { color: 'rgba(255,165,80,1)',  glow: 'rgba(255,150,60,0.62)', baseAlpha: 0.80 },
      { color: 'rgba(120,210,255,1)', glow: 'rgba(100,200,255,0.60)', baseAlpha: 0.78 },
    ],
    aurora: [
      { color: 'rgba(40,175,255,1)',  alpha: 0.48 },
      { color: 'rgba(255,160,70,1)',  alpha: 0.40 },
      { color: 'rgba(100,215,255,1)', alpha: 0.44 },
    ],
    particles: {
      colors: ['#ffffff','#99ddff','#ffd0aa','#cceeFF','#ffeecc','#aaeeff'],
      count: 220, shape: 'circle', glow: false, size: [2, 7], speed: 0.8,
    },
    flowColor: 'rgba(40,175,255,0.20)',
  },
  cosmos: {
    bgGradient: ['#040610', '#0a0e28', '#060a1e'],
    isDark: true,
    orbs: [
      { color: 'rgba(80,60,240,1)',   glow: 'rgba(70,50,240,0.78)', baseAlpha: 0.90 },
      { color: 'rgba(20,185,255,1)',  glow: 'rgba(10,175,255,0.72)', baseAlpha: 0.85 },
      { color: 'rgba(160,130,255,1)', glow: 'rgba(145,115,255,0.60)', baseAlpha: 0.70 },
    ],
    aurora: [
      { color: 'rgba(80,60,240,1)',   alpha: 0.60 },
      { color: 'rgba(20,185,255,1)',  alpha: 0.52 },
      { color: 'rgba(160,130,255,1)', alpha: 0.44 },
    ],
    particles: {
      colors: ['#ffffff','#bbccff','#aaaaff','#88ddff','#ccbbff','#eeeeff'],
      count: 380, shape: 'dot', glow: true, size: [0.8, 3.5], speed: 0.6,
    },
    rays: true,
    flowColor: 'rgba(80,100,255,0.18)',
  },
  starlit: {
    bgGradient: ['#020a18', '#060c22', '#080614'],
    isDark: true,
    orbs: [
      { color: 'rgba(0,200,255,1)',   glow: 'rgba(0,190,255,0.80)', baseAlpha: 0.92 },
      { color: 'rgba(255,20,175,1)',  glow: 'rgba(255,10,165,0.75)', baseAlpha: 0.88 },
      { color: 'rgba(100,70,255,1)',  glow: 'rgba(90,60,255,0.65)', baseAlpha: 0.78 },
    ],
    aurora: [
      { color: 'rgba(0,200,255,1)',   alpha: 0.62 },
      { color: 'rgba(255,20,175,1)',  alpha: 0.55 },
      { color: 'rgba(100,70,255,1)',  alpha: 0.45 },
    ],
    particles: {
      colors: ['#ffffff','#44eeff','#ff44cc','#bbaaff','#00ffee','#ff88dd'],
      count: 320, shape: 'cross', glow: true, size: [1.2, 4.5], speed: 1.2,
    },
    rays: true,
  },
  nebula: {
    bgGradient: ['#0e0520', '#180638', '#0a0e28'],
    isDark: true,
    orbs: [
      { color: 'rgba(140,40,255,1)',  glow: 'rgba(130,30,255,0.78)', baseAlpha: 0.90 },
      { color: 'rgba(255,60,150,1)',  glow: 'rgba(255,45,140,0.72)', baseAlpha: 0.85 },
      { color: 'rgba(255,185,30,1)',  glow: 'rgba(255,175,15,0.55)', baseAlpha: 0.68 },
    ],
    aurora: [
      { color: 'rgba(140,40,255,1)',  alpha: 0.62 },
      { color: 'rgba(255,60,150,1)',  alpha: 0.54 },
      { color: 'rgba(255,180,30,1)',  alpha: 0.38 },
    ],
    particles: {
      colors: ['#ffffff','#dd99ff','#ff99cc','#ffdd88','#cc88ff','#ffbb99'],
      count: 350, shape: 'star', glow: true, size: [1, 4.5], speed: 1.0,
    },
    rays: true,
    flowColor: 'rgba(140,50,255,0.18)',
  },
}

// ─── Particle ──────────────────────────────────────────────────────────────────
type Particle = {
  x: number; y: number
  vx: number; vy: number
  size: number
  alpha: number; baseAlpha: number
  phase: number; phaseSpeed: number
  color: string
  angle: number; angleSpeed: number
  trail: { x: number; y: number }[]
}

// ─── Draw helpers ──────────────────────────────────────────────────────────────
function drawShape(ctx: CanvasRenderingContext2D, shape: ThemeConfig['particles']['shape'], size: number, angle: number) {
  switch (shape) {
    case 'star': {
      const outer = size, inner = size * 0.42
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outer : inner
        const a = (i * Math.PI) / 4 - Math.PI / 2
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      ctx.closePath(); ctx.fill(); break
    }
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(0, -size); ctx.lineTo(size * 0.55, 0)
      ctx.lineTo(0, size); ctx.lineTo(-size * 0.55, 0)
      ctx.closePath(); ctx.fill(); break
    case 'cross':
      ctx.lineWidth = size * 0.4
      ctx.beginPath()
      ctx.moveTo(-size, 0); ctx.lineTo(size, 0)
      ctx.moveTo(0, -size); ctx.lineTo(0, size)
      ctx.stroke(); break
    case 'petal':
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, size * 0.55, size * 1.3, 0, 0, Math.PI * 2)
      ctx.fill(); break
    case 'circle':
      ctx.lineWidth = size * 0.35
      ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.stroke(); break
    default:
      ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill()
  }
}

function makeParticles(w: number, h: number, cfg: ThemeConfig, icfg: typeof INTENSITY_CONFIG['balanced']): Particle[] {
  const count = Math.round(cfg.particles.count * icfg.particleMult)
  const [sMin, sMax] = cfg.particles.size
  return Array.from({ length: count }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * cfg.particles.speed * icfg.speedMult,
    vy: (Math.random() - 0.5) * cfg.particles.speed * icfg.speedMult,
    size: sMin + Math.random() * (sMax - sMin),
    alpha: 0, baseAlpha: 0.65 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.025 + Math.random() * 0.055,
    color: cfg.particles.colors[Math.floor(Math.random() * cfg.particles.colors.length)],
    angle: Math.random() * Math.PI * 2,
    angleSpeed: (Math.random() - 0.5) * 0.05,
    trail: [],
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ThemeCanvasBackground({ theme, intensity = 'balanced' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const themeRef = useRef<ThemeId>(theme)
  const intensityRef = useRef<IntensityMode>(intensity)
  const transitionRef = useRef<{ from: ThemeId; to: ThemeId } | null>(null)

  useEffect(() => { intensityRef.current = intensity }, [intensity])

  useEffect(() => {
    const prev = themeRef.current
    if (prev !== theme) {
      themeRef.current = theme
      transitionRef.current = { from: prev, to: theme }
    }
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    let rafId = 0
    let width = 0, height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []
    let scatterParticles: Particle[] = []
    let transitionPhase: 'scatter' | 'gather' | null = null
    let transitionT = 0
    let frameCount = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const icfg = INTENSITY_CONFIG[intensityRef.current]
      particles = makeParticles(width, height, THEMES[themeRef.current], icfg)
    }

    // ── Layer 1: gradient background ──
    function drawLayer1(t: number, cfg: ThemeConfig, icfg: typeof INTENSITY_CONFIG['balanced']) {
      const [c1, c2, c3] = cfg.bgGradient
      const angle = t * 0.15 * icfg.flowSpeed
      const gx1 = width * 0.5 + Math.cos(angle) * width * 0.3
      const gy1 = height * 0.5 + Math.sin(angle) * height * 0.3
      const g = ctx.createRadialGradient(gx1, gy1, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.85)
      g.addColorStop(0, c1)
      g.addColorStop(0.5, c2)
      g.addColorStop(1, c3)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      // Aurora bands
      cfg.aurora.forEach(({ color, alpha }, i) => {
        const baseAlpha = alpha * icfg.auroraAlpha
        const yBase = height * (0.25 + i * 0.22)
        const speed = icfg.flowSpeed * (0.6 + i * 0.2)
        for (let layer = 0; layer < 3; layer++) {
          const grad = ctx.createLinearGradient(0, yBase - height * 0.12, 0, yBase + height * 0.12)
          const a = Math.min(0.95, baseAlpha * (0.6 + layer * 0.15))
          grad.addColorStop(0, 'rgba(0,0,0,0)')
          grad.addColorStop(0.5, color.replace('1)', `${a})`))
          grad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(-80, yBase)
          for (let x = -80; x <= width + 80; x += 8) {
            const nx = x * 0.0025 + layer * 0.8
            const ny = t * speed * 0.08 + i * 0.4
            const n = fbm(nx, ny) * 2 - 1
            const y = yBase + n * height * 0.07 + Math.sin(x * 0.005 + t * speed * 0.5) * height * 0.04
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width + 80, height)
          ctx.lineTo(-80, height)
          ctx.closePath()
          ctx.fill()
        }
      })
    }

    // ── Layer 2: orbs ──
    function drawLayer2(t: number, cfg: ThemeConfig, icfg: typeof INTENSITY_CONFIG['balanced']) {
      const orbDefs = [
        { bx: 0.18, by: 0.22 },
        { bx: 0.78, by: 0.18 },
        { bx: 0.55, by: 0.75 },
      ]
      const baseR = Math.min(width, height) * 0.22 * icfg.orbRadius

      cfg.orbs.forEach(({ color, glow, baseAlpha }, i) => {
        const def = orbDefs[i]
        // Large orbit movement
        const ox = Math.sin(t * (0.7 + i * 0.22) + i * 2.1) * width * 0.18 * icfg.orbRadius
        const oy = Math.cos(t * (0.55 + i * 0.18) + i * 1.7) * height * 0.15 * icfg.orbRadius
        const x = width * def.bx + ox
        const y = height * def.by + oy
        const breathe = 1 + Math.sin(t * (1.2 + i * 0.3)) * 0.15
        const rx = baseR * (0.9 + i * 0.08) * breathe
        const finalAlpha = Math.min(1, baseAlpha * icfg.orbAlpha)

        // Outer halo
        ctx.save()
        const halo = ctx.createRadialGradient(x, y, 0, x, y, rx * 2.2)
        halo.addColorStop(0, glow.replace('0.7)', `${finalAlpha * 0.5})`).replace('0.75)', `${finalAlpha * 0.5})`).replace('0.8)', `${finalAlpha * 0.5})`))
        halo.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = halo
        ctx.beginPath(); ctx.arc(x, y, rx * 2.2, 0, Math.PI * 2); ctx.fill()
        ctx.restore()

        // Core
        ctx.save()
        ctx.shadowColor = glow
        ctx.shadowBlur = rx * 0.6 * icfg.glowMult
        const core = ctx.createRadialGradient(x - rx * 0.25, y - rx * 0.25, rx * 0.05, x, y, rx)
        core.addColorStop(0, color.replace('1)', `${finalAlpha})`))
        core.addColorStop(0.6, glow)
        core.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = core
        ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })

      // Light rays for dark themes
      if (cfg.rays) {
        ctx.save()
        const cx = width * (0.5 + Math.sin(t * 0.08) * 0.08)
        const cy = height * (0.3 + Math.cos(t * 0.06) * 0.06)
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + t * 0.05
          const len = (0.5 + valueNoise(i * 0.6, t * 0.1) * 0.5) * Math.max(width, height)
          const a = (0.04 + Math.sin(t * 0.4 + i) * 0.025) * icfg.auroraAlpha
          const rayG = ctx.createLinearGradient(cx, cy, cx + Math.cos(ang) * len, cy + Math.sin(ang) * len)
          rayG.addColorStop(0, cfg.aurora[i % cfg.aurora.length].color.replace('1)', `${a})`))
          rayG.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.strokeStyle = rayG
          ctx.lineWidth = 2.5
          ctx.globalAlpha = 0.7
          ctx.beginPath(); ctx.moveTo(cx, cy)
          ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Flow field
      if (cfg.flowColor) {
        ctx.save()
        ctx.strokeStyle = cfg.flowColor
        ctx.lineWidth = 1.2
        for (let i = 0; i < 16; i++) {
          for (let j = 0; j < 10; j++) {
            const sx = (width / 16) * i + width / 32
            const sy = (height / 10) * j + height / 20
            const ang = fbm(sx * 0.003 + t * 0.08 * icfg.flowSpeed, sy * 0.003) * Math.PI * 4
            const len = 28 + valueNoise(sx * 0.005, sy * 0.005 + t * 0.05) * 22
            ctx.beginPath(); ctx.moveTo(sx, sy)
            ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len)
            ctx.stroke()
          }
        }
        ctx.restore()
      }
    }

    // ── Layer 3: particles ──
    function drawLayer3(cfg: ThemeConfig, icfg: typeof INTENSITY_CONFIG['balanced'], t: number) {
      const trailLen = icfg.trailLen
      particles.forEach((p) => {
        // Flow influence
        const nx = p.x * 0.002, ny = p.y * 0.002
        const flowAng = fbm(nx + t * 0.1, ny + t * 0.08) * Math.PI * 2.5
        p.vx += Math.cos(flowAng) * 0.012 * icfg.speedMult
        p.vy += Math.sin(flowAng) * 0.012 * icfg.speedMult
        // Speed cap
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const maxSpd = cfg.particles.speed * icfg.speedMult * 1.8
        if (spd > maxSpd) { p.vx *= maxSpd / spd; p.vy *= maxSpd / spd }
        p.vx *= 0.98; p.vy *= 0.98

        // Trail
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > trailLen) p.trail.shift()

        p.x += p.vx; p.y += p.vy
        p.phase += p.phaseSpeed; p.angle += p.angleSpeed
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20

        const twinkle = 0.5 + Math.sin(p.phase) * 0.5
        p.alpha = Math.min(p.baseAlpha * twinkle, p.alpha + 0.008)

        // Draw trail
        if (p.trail.length > 1) {
          ctx.save()
          for (let ti = 1; ti < p.trail.length; ti++) {
            const ta = (ti / p.trail.length) * p.alpha * 0.4
            ctx.globalAlpha = ta
            ctx.strokeStyle = p.color
            ctx.lineWidth = p.size * (ti / p.trail.length) * 0.6
            ctx.beginPath()
            ctx.moveTo(p.trail[ti - 1].x, p.trail[ti - 1].y)
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y)
            ctx.stroke()
          }
          ctx.restore()
        }

        // Draw particle — double glow + size pulse
        const pulsedSize = p.size * (1 + Math.sin(p.phase * 2) * 0.25)
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.globalAlpha = p.alpha
        if (cfg.particles.glow) {
          // Outer soft halo
          ctx.shadowColor = p.color
          ctx.shadowBlur = pulsedSize * 7 * icfg.glowMult
          ctx.fillStyle = p.color
          ctx.strokeStyle = p.color
          drawShape(ctx, cfg.particles.shape, pulsedSize * 1.6, p.angle)
          // Inner bright core
          ctx.shadowBlur = pulsedSize * 2 * icfg.glowMult
          drawShape(ctx, cfg.particles.shape, pulsedSize, p.angle)
        } else {
          ctx.fillStyle = p.color
          ctx.strokeStyle = p.color
          drawShape(ctx, cfg.particles.shape, pulsedSize, p.angle)
        }
        ctx.restore()
      })
    }

    // ── Debug overlay ──
    function drawDebugOverlay(cfg: ThemeConfig, icfg: typeof INTENSITY_CONFIG['balanced']) {
      if (intensityRef.current !== 'debug') return
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(12, 12, 260, 148)
      ctx.fillStyle = '#00ff88'
      ctx.font = 'bold 12px monospace'
      const lines = [
        `Theme: ${themeRef.current}  Intensity: ${intensityRef.current}`,
        `Canvas: ${width}×${height}  DPR: ${dpr}`,
        `Particles: ${particles.length}  Orbs: ${cfg.orbs.length}`,
        `RAF: ✓ running  frame: ${frameCount}`,
        `Speed×${icfg.speedMult}  Glow×${icfg.glowMult}`,
        `Trail: ${icfg.trailLen}  OrbR×${icfg.orbRadius}`,
      ]
      lines.forEach((line, i) => ctx.fillText(line, 20, 34 + i * 20))
      ctx.restore()
    }

    // ── Main render loop ──
    function render(timestamp: number) {
      frameCount++
      const t = timestamp * 0.001
      const icfg = INTENSITY_CONFIG[intensityRef.current]
      const cfg = THEMES[themeRef.current]

      // Handle theme transition
      if (transitionRef.current && transitionPhase === null) {
        const tr = transitionRef.current
        transitionRef.current = null
        transitionPhase = 'scatter'
        transitionT = 0
        scatterParticles = particles.map((p) => ({
          ...p, trail: [],
          vx: (Math.random() - 0.5) * 8 * icfg.speedMult,
          vy: (Math.random() - 0.5) * 8 * icfg.speedMult,
        }))
        particles = makeParticles(width, height, THEMES[tr.to], icfg).map((p) => ({
          ...p,
          x: width * 0.5 + (Math.random() - 0.5) * 60,
          y: height * 0.5 + (Math.random() - 0.5) * 60,
          alpha: 0,
        }))
      }

      ctx.clearRect(0, 0, width, height)

      drawLayer1(t, cfg, icfg)
      drawLayer2(t, cfg, icfg)

      // Scatter old particles
      if (transitionPhase === 'scatter') {
        transitionT += 0.025
        const a = Math.max(0, 1 - transitionT * 3)
        scatterParticles.forEach((p) => {
          p.x += p.vx; p.y += p.vy; p.alpha = a
          if (a > 0) {
            ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = a
            ctx.fillStyle = p.color; ctx.strokeStyle = p.color
            drawShape(ctx, cfg.particles.shape, p.size, p.angle)
            ctx.restore()
          }
        })
        if (transitionT >= 0.4) { transitionPhase = 'gather'; transitionT = 0 }
      }

      drawLayer3(cfg, icfg, t)

      if (transitionPhase === 'gather') {
        transitionT += 0.02
        if (transitionT >= 0.5) { transitionPhase = null }
      }

      drawDebugOverlay(cfg, icfg)

      rafId = requestAnimationFrame(render)
    }

    resize()
    rafId = requestAnimationFrame(render)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 1,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
