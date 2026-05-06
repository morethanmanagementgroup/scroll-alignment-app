'use client'
import { useRef, useCallback } from 'react'
import type { DailyScroll, User } from '@/lib/types'
import { getArchetype } from '@/lib/archetypes'
import { formatDate } from '@/lib/storage'

interface ShareableScrollCardProps {
  scroll: DailyScroll
  user: User
}

// Cross-browser rounded rect (ctx.roundRect not supported in all browsers)
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Draw the scroll compass mark (four-pointed star) on canvas
function drawScrollMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const r = size / 2
  ctx.save()
  ctx.translate(cx, cy)

  // Outer circle
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(201, 169, 110, 0.5)'
  ctx.lineWidth = 0.8
  ctx.stroke()

  // Inner circle
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(201, 169, 110, 0.25)'
  ctx.lineWidth = 0.5
  ctx.stroke()

  // Gold color
  ctx.fillStyle = '#C9A96E'

  // Vertical arm
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.82)
  ctx.bezierCurveTo(r * 0.16, -r * 0.3, r * 0.32, 0, r * 0.32, 0)
  ctx.bezierCurveTo(r * 0.32, 0, r * 0.16, r * 0.3, 0, r * 0.82)
  ctx.bezierCurveTo(-r * 0.16, r * 0.3, -r * 0.32, 0, -r * 0.32, 0)
  ctx.bezierCurveTo(-r * 0.32, 0, -r * 0.16, -r * 0.3, 0, -r * 0.82)
  ctx.globalAlpha = 0.9
  ctx.fill()

  // Horizontal arm
  ctx.beginPath()
  ctx.moveTo(-r * 0.82, 0)
  ctx.bezierCurveTo(-r * 0.3, -r * 0.16, 0, -r * 0.32, 0, -r * 0.32)
  ctx.bezierCurveTo(0, -r * 0.32, r * 0.3, -r * 0.16, r * 0.82, 0)
  ctx.bezierCurveTo(r * 0.3, r * 0.16, 0, r * 0.32, 0, r * 0.32)
  ctx.bezierCurveTo(0, r * 0.32, -r * 0.3, r * 0.16, -r * 0.82, 0)
  ctx.fill()
  ctx.globalAlpha = 1

  // Center dot
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

export default function ShareableScrollCard({ scroll, user }: ShareableScrollCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = 1080
    const H = 1080
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Background ──────────────────────────────────────────
    ctx.fillStyle = '#080810'
    ctx.fillRect(0, 0, W, H)

    // Purple orb top-right
    const grad1 = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, 320)
    grad1.addColorStop(0, 'rgba(107, 78, 138, 0.25)')
    grad1.addColorStop(1, 'transparent')
    ctx.fillStyle = grad1
    ctx.fillRect(0, 0, W, H)

    // Gold orb bottom-left
    const grad2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 0, W * 0.15, H * 0.85, 280)
    grad2.addColorStop(0, 'rgba(201, 169, 110, 0.18)')
    grad2.addColorStop(1, 'transparent')
    ctx.fillStyle = grad2
    ctx.fillRect(0, 0, W, H)

    // ── Border ───────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(32, 32, W - 64, H - 64)

    // Corner accents
    const accentLen = 28
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.6)'
    ctx.lineWidth = 1.5
    const corners = [
      [32, 32], [W - 32, 32], [32, H - 32], [W - 32, H - 32]
    ] as [number, number][]
    corners.forEach(([x, y]) => {
      const dx = x < W / 2 ? accentLen : -accentLen
      const dy = y < H / 2 ? accentLen : -accentLen
      ctx.beginPath()
      ctx.moveTo(x + dx, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy)
      ctx.stroke()
    })

    // ── Logo mark ────────────────────────────────────────────
    drawScrollMark(ctx, W / 2, 130, 72)

    // ── SCROLL wordmark ──────────────────────────────────────
    ctx.font = '600 14px Georgia, serif'
    ctx.letterSpacing = '0.4em'
    ctx.fillStyle = 'rgba(201, 169, 110, 0.7)'
    ctx.textAlign = 'center'
    ctx.fillText('SCROLL ALIGNMENT', W / 2, 192)

    // ── Date & theme ─────────────────────────────────────────
    ctx.font = '13px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240, 235, 225, 0.45)'
    ctx.fillText(formatDate(scroll.date).toUpperCase(), W / 2, 230)

    // Divider
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(W / 2 - 180, 252)
    ctx.lineTo(W / 2 + 180, 252)
    ctx.stroke()

    // Theme
    ctx.font = 'italic 15px Georgia, serif'
    ctx.fillStyle = 'rgba(201, 169, 110, 0.6)'
    ctx.fillText(scroll.theme, W / 2, 278)

    // ── Affirmation ──────────────────────────────────────────
    ctx.font = 'italic 42px Georgia, serif'
    ctx.fillStyle = '#F0EBE1'
    ctx.textAlign = 'center'
    const affirmation = `"${scroll.affirmation}"`
    const affLines = wrapText(ctx, affirmation, W - 160)
    const affLineH = 58
    const affTotalH = affLines.length * affLineH
    const affY = H / 2 - affTotalH / 2

    // Subtle card behind affirmation
    ctx.fillStyle = 'rgba(22, 22, 36, 0.7)'
    roundRect(ctx, 80, affY - 48, W - 160, affTotalH + 80, 12)
    ctx.fill()
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.15)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#F0EBE1'
    affLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, affY + i * affLineH)
    })

    // ── Power Move ───────────────────────────────────────────
    const pmY = affY + affTotalH + 72

    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(201, 169, 110, 0.5)'
    ctx.letterSpacing = '0.25em'
    ctx.fillText('POWER MOVE', W / 2, pmY)

    ctx.letterSpacing = '0'
    ctx.font = '18px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240, 235, 225, 0.75)'
    const pmLines = wrapText(ctx, scroll.powerMove, W - 200)
    pmLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, W / 2, pmY + 32 + i * 28)
    })

    // ── Archetype & life path ────────────────────────────────
    const archetype = getArchetype(user.lifePathNumber)
    const bottomY = H - 120

    ctx.font = '11px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(201, 169, 110, 0.4)'
    ctx.letterSpacing = '0.2em'
    ctx.fillText('YOUR ARCHETYPE', W / 2, bottomY)

    ctx.letterSpacing = '0'
    ctx.font = 'bold 20px Georgia, serif'
    ctx.fillStyle = '#C9A96E'
    ctx.fillText(`${archetype.glyph} ${archetype.name} · Life Path ${user.lifePathNumber}`, W / 2, bottomY + 34)

    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(240, 235, 225, 0.35)'
    ctx.fillText('scroll-alignment.com', W / 2, bottomY + 66)

    // ── Score badge ──────────────────────────────────────────
    // Small pill top-right corner
    const score = scroll.completionScore ?? 0
    if (score > 0) {
      ctx.fillStyle = 'rgba(201, 169, 110, 0.15)'
      roundRect(ctx, W - 160, 56, 96, 32, 16)
      ctx.fill()
      ctx.strokeStyle = 'rgba(201, 169, 110, 0.3)'
      ctx.lineWidth = 0.75
      ctx.stroke()
      ctx.font = 'bold 13px Inter, system-ui, sans-serif'
      ctx.fillStyle = '#C9A96E'
      ctx.textAlign = 'center'
      ctx.fillText(`${score}% aligned`, W - 112, 76)
    }

  }, [scroll, user])

  const handleDownload = useCallback(() => {
    drawCard()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `scroll-${scroll.date}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }, [drawCard, scroll.date])

  const handleShare = useCallback(async () => {
    drawCard()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `scroll-${scroll.date}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Daily Scroll',
            text: `"${scroll.affirmation}" — Scroll Alignment`,
          })
        } catch { /* user cancelled */ }
      } else {
        handleDownload()
      }
    }, 'image/png', 1.0)
  }, [drawCard, scroll, handleDownload])

  return (
    <div className="scroll-card-gold p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Share Your Scroll</p>
          <p className="text-scroll-bone-dim text-xs">Download your daily card</p>
        </div>
        <span className="text-scroll-gold text-xl">✦</span>
      </div>

      {/* Preview — small version rendered inline */}
      <div className="relative rounded-lg overflow-hidden mb-4 bg-scroll-black border border-scroll-border" style={{ aspectRatio: '1/1' }}>
        <canvas ref={canvasRef} className="hidden" />
        {/* Visual preview (CSS-rendered, not canvas) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-3">
            {/* Mini mark */}
            <svg width="28" height="28" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="37" stroke="#C9A96E" strokeWidth="0.75" opacity="0.5"/>
              <path d="M40 8 C40 8 41.8 28 52.5 40 C41.8 52 40 72 40 72 C40 72 38.2 52 27.5 40 C38.2 28 40 8 40 8Z" fill="#C9A96E" opacity="0.9"/>
              <path d="M8 40 C8 40 28 38.2 40 27.5 C52 38.2 72 40 72 40 C72 40 52 41.8 40 52.5 C28 41.8 8 40 8 40Z" fill="#C9A96E" opacity="0.9"/>
              <circle cx="40" cy="40" r="2.5" fill="#C9A96E"/>
            </svg>
          </div>
          <p className="text-scroll-gold/50 text-[9px] tracking-widest uppercase mb-2">Today's Affirmation</p>
          <p className="font-serif text-scroll-bone text-sm italic leading-snug line-clamp-3">"{scroll.affirmation}"</p>
          <div className="mt-3 pt-3 border-t border-scroll-border/50 w-full">
            <p className="text-scroll-gold text-[10px] font-medium">{getArchetype(user.lifePathNumber).name} · Life Path {user.lifePathNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 bg-gold-gradient text-scroll-black text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Share ✦
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 border border-scroll-gold/30 text-scroll-gold text-sm py-2.5 rounded-lg hover:border-scroll-gold/60 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  )
}
