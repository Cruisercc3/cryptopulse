"use client"

import { useState } from "react"
import { LineChart } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { usePriceHistory, type HistoryRange } from "@/hooks/use-markets"
import type { Market } from "@/lib/signals"

const timeframes: Array<{ label: string; range: HistoryRange }> = [
  { label: "24H", range: "1d" },
  { label: "7D", range: "1w" },
  { label: "30D", range: "1m" },
  { label: "All", range: "max" },
]

function formatTick(t: number, range: HistoryRange): string {
  const d = new Date(t * 1000)
  if (range === "1d") return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** The market's Yes price over time, from Polymarket's CLOB price history. */
export function ProbabilityChart({ market }: { market: Market | null }) {
  const [range, setRange] = useState<HistoryRange>("1w")
  const { points, isLoading, error } = usePriceHistory(market?.yesTokenId ?? null, range)

  const first = points[0]?.p
  const last = points[points.length - 1]?.p
  const delta = first !== undefined && last !== undefined ? last - first : 0
  const color = delta > 0 ? "#10b981" : delta < 0 ? "#ef4444" : "#64748b"
  const data = points.map((p) => ({ t: p.t, value: p.p }))

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <LineChart className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Probability History</h3>
            <p className="text-xs text-muted-foreground truncate">
              Yes price from Polymarket&apos;s order book
              {points.length > 1 && (
                <span className={delta >= 0 ? " text-emerald-400" : " text-red-400"}>
                  {" "}· {delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)}pp over this window
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 border border-border/30 self-start sm:self-auto">
          {timeframes.map((tf) => (
            <button
              key={tf.range}
              onClick={() => setRange(tf.range)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                range === tf.range
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 p-2">
        {isLoading && points.length === 0 ? (
          <div className="h-full rounded-lg bg-secondary/30 animate-pulse" />
        ) : points.length < 2 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            {error ?? "No trades in this window."}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="prob-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="t"
                tickFormatter={(t) => formatTick(t, range)}
                tick={{ fontSize: 10, fill: "#888" }}
                minTickGap={40}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(v) => `${Math.round(v)}%`}
                tick={{ fontSize: 10, fill: "#888" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString()}
                formatter={(v) => [`${Number(v).toFixed(1)}%`, "Yes"]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#prob-fill)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
