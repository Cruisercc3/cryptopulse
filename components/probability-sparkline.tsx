"use client"

import { useId } from "react"
import type { HistoryPoint } from "@/hooks/use-markets"

/** Pads the min..max of a series so small moves stay visible, clamped to 0..100. */
function domain(values: number[], pad = 2): [number, number] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, pad * 2)
  const mid = (max + min) / 2
  return [Math.max(0, mid - span / 2 - pad), Math.min(100, mid + span / 2 + pad)]
}

/** Resamples to `count` buckets, taking the last price in each bucket. */
function bucket(points: HistoryPoint[], count: number): number[] {
  if (points.length <= count) return points.map((p) => p.p)
  const out: number[] = []
  const size = points.length / count
  for (let i = 0; i < count; i++) {
    const end = Math.min(points.length - 1, Math.floor((i + 1) * size) - 1)
    out.push(points[end].p)
  }
  return out
}

interface SparkProps {
  points: HistoryPoint[]
  isLoading?: boolean
  /** Current probability, drawn as a dashed line (bars variant). */
  current?: number
  className?: string
  barClassName?: string
  bars?: number
  emptyLabel?: string
}

/** Bars of real Yes prices from Polymarket's CLOB history. */
export function ProbabilityBars({
  points,
  isLoading,
  current,
  className = "h-20",
  barClassName = "bg-primary/60",
  bars = 24,
  emptyLabel = "No trades in this window",
}: SparkProps) {
  if (isLoading && points.length === 0) {
    return <div className={`${className} rounded-lg bg-secondary/30 animate-pulse`} />
  }
  if (points.length < 2) {
    return (
      <div className={`${className} rounded-lg bg-secondary/30 flex items-center justify-center`}>
        <span className="text-[11px] text-muted-foreground">{emptyLabel}</span>
      </div>
    )
  }

  const values = bucket(points, bars)
  const [lo, hi] = domain(current !== undefined ? [...values, current] : values)
  const scale = (v: number) => ((v - lo) / (hi - lo || 1)) * 100
  const first = new Date(points[0].t * 1000)
  const last = new Date(points[points.length - 1].t * 1000)

  return (
    <div
      className={`${className} rounded-lg bg-secondary/30 relative flex items-end px-1 pb-1 gap-px`}
      title={`Yes price from ${first.toLocaleString()} to ${last.toLocaleString()}, ${lo.toFixed(0)}% to ${hi.toFixed(0)}% scale`}
    >
      {current !== undefined && (
        <div
          className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/40 pointer-events-none"
          style={{ bottom: `${scale(current)}%` }}
        />
      )}
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t transition-all duration-200 opacity-70 hover:opacity-100 ${barClassName}`}
          style={{ height: `${Math.max(3, scale(v))}%`, minWidth: "2px" }}
          title={`${v.toFixed(1)}%`}
        />
      ))}
    </div>
  )
}

/** A small line with an area fill, for compact rows and cards. */
export function ProbabilityLine({
  points,
  isLoading,
  color = "#10b981",
  className = "w-full h-8",
}: {
  points: HistoryPoint[]
  isLoading?: boolean
  color?: string
  className?: string
}) {
  const gradientId = useId().replace(/:/g, "")
  if (isLoading && points.length === 0) {
    return <div className={`${className} rounded bg-secondary/30 animate-pulse`} />
  }
  if (points.length < 2) {
    return <div className={`${className} rounded bg-secondary/20`} />
  }
  const values = bucket(points, 40)
  const [lo, hi] = domain(values, 1)
  const y = (v: number) => 30 - ((v - lo) / (hi - lo || 1)) * 28
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (values.length - 1)) * 100} ${y(v)}`).join(" ")

  return (
    <svg className={className} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${path} L 100 32 L 0 32 Z`} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
