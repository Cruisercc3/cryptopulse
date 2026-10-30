"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react"
import type { FearGreedResponse } from "@/app/api/fear-greed/route"

// Map value 0-100 to a color between deep red → amber → green
function getValueColor(v: number): string {
  if (v <= 24) return "#ef4444" // extreme fear — red
  if (v <= 44) return "#f97316" // fear — orange
  if (v <= 55) return "#eab308" // neutral — yellow
  if (v <= 74) return "#84cc16" // greed — lime
  return "#22c55e" // extreme greed — green
}

function getZoneBg(v: number): string {
  if (v <= 24) return "bg-red-500/10 border-red-500/30"
  if (v <= 44) return "bg-orange-500/10 border-orange-500/30"
  if (v <= 55) return "bg-yellow-500/10 border-yellow-500/30"
  if (v <= 74) return "bg-lime-500/10 border-lime-500/30"
  return "bg-emerald-500/10 border-emerald-500/30"
}

function getZoneText(v: number): string {
  if (v <= 24) return "text-red-400"
  if (v <= 44) return "text-orange-400"
  if (v <= 55) return "text-yellow-400"
  if (v <= 74) return "text-lime-400"
  return "text-emerald-400"
}

// Draw semicircle gauge on canvas
function drawGauge(canvas: HTMLCanvasElement, value: number) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  // Use getBoundingClientRect for accurate layout dimensions; fall back to fixed size
  const rect = canvas.getBoundingClientRect()
  const w = rect.width > 0 ? rect.width : 280
  const h = rect.height > 0 ? rect.height : 140

  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h - 12
  // Ensure radius is always positive
  const r = Math.max(10, Math.min(w / 2 - 16, h - 28))
  const startAngle = Math.PI
  const endAngle = 2 * Math.PI

  // Background track zones
  const zones = [
    { from: 0, to: 25, color: "rgba(239,68,68,0.18)" },
    { from: 25, to: 45, color: "rgba(249,115,22,0.18)" },
    { from: 45, to: 55, color: "rgba(234,179,8,0.18)" },
    { from: 55, to: 75, color: "rgba(132,204,22,0.18)" },
    { from: 75, to: 100, color: "rgba(34,197,94,0.18)" },
  ]

  zones.forEach(({ from, to, color }) => {
    const a1 = startAngle + (from / 100) * Math.PI
    const a2 = startAngle + (to / 100) * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, r, a1, a2)
    ctx.lineWidth = 22
    ctx.strokeStyle = color
    ctx.lineCap = "butt"
    ctx.stroke()
  })

  // Track outline
  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, endAngle)
  ctx.lineWidth = 22
  ctx.strokeStyle = "rgba(255,255,255,0.04)"
  ctx.lineCap = "round"
  ctx.stroke()

  // Value arc
  const pct = value / 100
  const valueAngle = startAngle + pct * Math.PI
  const gradient = ctx.createLinearGradient(cx - r, cy, cx + r, cy)
  gradient.addColorStop(0, "#ef4444")
  gradient.addColorStop(0.25, "#f97316")
  gradient.addColorStop(0.5, "#eab308")
  gradient.addColorStop(0.75, "#84cc16")
  gradient.addColorStop(1, "#22c55e")

  ctx.beginPath()
  ctx.arc(cx, cy, r, startAngle, valueAngle)
  ctx.lineWidth = 22
  ctx.strokeStyle = gradient
  ctx.lineCap = "round"
  ctx.stroke()

  // Needle
  const needleAngle = startAngle + pct * Math.PI
  const needleLen = r - 10
  const nx = cx + Math.cos(needleAngle) * needleLen
  const ny = cy + Math.sin(needleAngle) * needleLen
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(nx, ny)
  ctx.lineWidth = 2.5
  ctx.strokeStyle = "#ffffff"
  ctx.lineCap = "round"
  ctx.shadowColor = "#ffffff"
  ctx.shadowBlur = 8
  ctx.stroke()
  ctx.shadowBlur = 0

  // Center dot
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, 2 * Math.PI)
  ctx.fillStyle = "#ffffff"
  ctx.shadowColor = getValueColor(value)
  ctx.shadowBlur = 10
  ctx.fill()
  ctx.shadowBlur = 0

  // Zone labels
  const labelZones = [
    { label: "Fear", pct: 0.175 },
    { label: "Neutral", pct: 0.5 },
    { label: "Greed", pct: 0.825 },
  ]
  ctx.font = `bold ${Math.max(9, r * 0.095)}px monospace`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  labelZones.forEach(({ label, pct: lp }) => {
    const angle = startAngle + lp * Math.PI
    const lr = r - 36
    const lx = cx + Math.cos(angle) * lr
    const ly = cy + Math.sin(angle) * lr
    ctx.fillStyle = "rgba(255,255,255,0.35)"
    ctx.fillText(label, lx, ly)
  })
}

// Mini sparkline for 30-day history
function HistorySparkline({ history }: { history: { value: number; timestamp: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || history.length < 2) return

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = rect.width > 0 ? rect.width : 280
      const h = rect.height > 0 ? rect.height : 52

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      const min = Math.min(...history.map((d) => d.value))
      const max = Math.max(...history.map((d) => d.value))
      const range = max - min || 1
      const pad = 4
      const points = history.map((d, i) => ({
        x: pad + (i / (history.length - 1)) * (w - pad * 2),
        y: h - pad - ((d.value - min) / range) * (h - pad * 2),
        v: d.value,
      }))

      // Gradient fill
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, "rgba(239,68,68,0.3)")
      grad.addColorStop(0.5, "rgba(234,179,8,0.3)")
      grad.addColorStop(1, "rgba(34,197,94,0.3)")

      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else {
          const prev = points[i - 1]
          const cpx = (prev.x + p.x) / 2
          ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y)
        }
      })
      ctx.lineTo(points[points.length - 1].x, h)
      ctx.lineTo(points[0].x, h)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Line
      ctx.beginPath()
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y)
        else {
          const prev = points[i - 1]
          const cpx = (prev.x + p.x) / 2
          ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y)
        }
      })
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0)
      lineGrad.addColorStop(0, "#ef4444")
      lineGrad.addColorStop(0.5, "#eab308")
      lineGrad.addColorStop(1, "#22c55e")
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Latest dot
      const last = points[points.length - 1]
      ctx.beginPath()
      ctx.arc(last.x, last.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = getValueColor(last.v)
      ctx.shadowColor = getValueColor(last.v)
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Defer to next frame so the canvas has layout dimensions
    const raf = requestAnimationFrame(draw)
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [history])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  )
}

interface FearGreedGaugeProps {
  compact?: boolean
}

export function FearGreedGauge({ compact = false }: FearGreedGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animated, setAnimated] = useState(0)
  const [data, setData] = useState<FearGreedResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch("/api/fear-greed")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: FearGreedResponse = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300_000) // refresh every 5 min
    return () => clearInterval(interval)
  }, [fetchData])

  const currentValue = data?.current?.value ?? 0

  // Animate needle on load
  useEffect(() => {
    if (!currentValue) return
    let frame = 0
    const total = 60
    const tick = () => {
      frame++
      const eased = 1 - Math.pow(1 - frame / total, 3)
      setAnimated(Math.round(eased * currentValue))
      if (frame < total) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [currentValue])

  // Draw gauge — defer first paint to ensure layout dimensions are available
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // requestAnimationFrame ensures the canvas is fully laid out before we read its size
    const raf = requestAnimationFrame(() => drawGauge(canvas, animated))
    const observer = new ResizeObserver(() => drawGauge(canvas, animated))
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [animated])

  if (error) {
    return (
      <div className={`glass-card rounded-xl border border-border/40 p-4 flex items-center gap-2 ${compact ? "text-xs" : ""}`}>
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-muted-foreground text-xs">Fear & Greed unavailable</span>
      </div>
    )
  }

  const change =
    data?.current && data?.yesterday
      ? data.current.value - data.yesterday.value
      : null

  const color = getValueColor(currentValue)
  const zoneBg = getZoneBg(currentValue)
  const zoneText = getZoneText(currentValue)

  if (compact) {
    // Inline pill for header bars
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border glass-card ${zoneBg} transition-all duration-500`}>
        {/* Pulsing dot indicator */}
        <div
          className="w-2 h-2 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
        <div className="flex flex-col leading-none">
          <span className={`text-[11px] font-bold font-mono tabular-nums ${zoneText}`}>
            {isLoading ? "—" : `${currentValue} · ${data?.current?.classification ?? ""}`}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium">Fear &amp; Greed</span>
        </div>
        {change !== null && (
          <div className={`flex items-center gap-0.5 text-[10px] font-mono ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {change >= 0 ? "+" : ""}{change}
          </div>
        )}
      </div>
    )
  }

  // Full gauge card
  return (
    <div className="glass-card rounded-2xl border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Fear &amp; Greed Index
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            alternative.me
          </span>
          <button
            onClick={() => fetchData()}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Refresh fear and greed index"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Gauge */}
      <div className="px-5 pt-4 pb-2">
        <div className="relative" style={{ height: "140px" }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />
          {/* Center value overlay */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pointer-events-none">
            <span
              className="text-4xl font-black font-mono tabular-nums leading-none transition-all duration-100"
              style={{ color, textShadow: `0 0 24px ${color}40` }}
            >
              {isLoading ? "—" : animated}
            </span>
            <span className={`text-sm font-semibold mt-1 ${zoneText}`}>
              {isLoading ? "Loading..." : data?.current?.classification}
            </span>
          </div>
        </div>
      </div>

      {/* Day change row */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/20 border border-border/20">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Today</p>
              <p className="text-sm font-bold font-mono tabular-nums" style={{ color }}>
                {isLoading ? "—" : currentValue}
              </p>
            </div>
            {data?.yesterday && (
              <>
                <div className="w-px h-8 bg-border/40" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">Yesterday</p>
                  <p className="text-sm font-bold font-mono tabular-nums text-muted-foreground">
                    {data.yesterday.value}
                  </p>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase">Change</p>
                  <p className={`text-sm font-bold font-mono tabular-nums flex items-center gap-1 ${change && change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {change !== null && (change >= 0
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {change !== null ? `${change >= 0 ? "+" : ""}${change}` : "—"}
                  </p>
                </div>
              </>
            )}
          </div>
          {data?.current?.timeUntilUpdate && (
            <div className="text-right">
              <p className="text-[9px] text-muted-foreground font-mono uppercase">Next Update</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {Math.floor(data.current.timeUntilUpdate / 3600)}h{" "}
                {Math.floor((data.current.timeUntilUpdate % 3600) / 60)}m
              </p>
            </div>
          )}
        </div>

        {/* Zone legend */}
        <div className="mt-3 grid grid-cols-5 gap-1">
          {[
            { label: "Extreme\nFear", range: "0–24", color: "#ef4444" },
            { label: "Fear", range: "25–44", color: "#f97316" },
            { label: "Neutral", range: "45–55", color: "#eab308" },
            { label: "Greed", range: "56–74", color: "#84cc16" },
            { label: "Extreme\nGreed", range: "75–100", color: "#22c55e" },
          ].map((z) => {
            const isActive =
              (z.label.includes("Fear") && !z.label.includes("Extreme") && currentValue >= 25 && currentValue <= 44) ||
              (z.label.includes("Extreme\nFear") && currentValue <= 24) ||
              (z.label === "Neutral" && currentValue >= 45 && currentValue <= 55) ||
              (z.label === "Greed" && currentValue >= 56 && currentValue <= 74) ||
              (z.label.includes("Extreme\nGreed") && currentValue >= 75)
            return (
              <div
                key={z.label}
                className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg transition-all duration-300 ${isActive ? "bg-secondary/50 ring-1 ring-white/10" : ""}`}
              >
                <div
                  className="w-full h-1 rounded-full"
                  style={{ backgroundColor: isActive ? z.color : `${z.color}40` }}
                />
                <span
                  className="text-[9px] font-mono text-center leading-tight whitespace-pre-line"
                  style={{ color: isActive ? z.color : "rgba(255,255,255,0.3)" }}
                >
                  {z.label}
                </span>
                <span className="text-[8px] text-muted-foreground font-mono">{z.range}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 30-day history sparkline */}
      {data?.history && data.history.length > 1 && (
        <div className="px-5 pb-5 border-t border-border/30 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              30-Day History
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono" style={{ color: "#ef4444" }}>Fear</span>
              <span className="text-[9px] font-mono" style={{ color: "#eab308" }}>Neutral</span>
              <span className="text-[9px] font-mono" style={{ color: "#22c55e" }}>Greed</span>
            </div>
          </div>
          <div style={{ height: "52px" }}>
            <HistorySparkline history={data.history} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground font-mono">30d ago</span>
            <span className="text-[9px] text-muted-foreground font-mono">Today</span>
          </div>
        </div>
      )}
    </div>
  )
}
