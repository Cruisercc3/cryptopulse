"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  Eye,
  Zap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMarkets } from "@/hooks/use-markets"
import { formatDate, formatProbability, formatUsd, type SignalType } from "@/lib/signals"

const signalConfig: Record<SignalType, { label: string; className: string }> = {
  bullish: { label: "Bullish", className: "text-emerald-500 bg-emerald-500/10" },
  bearish: { label: "Bearish", className: "text-red-500 bg-red-500/10" },
  neutral: { label: "Neutral", className: "text-muted-foreground bg-muted" },
  contrarian: { label: "Contrarian", className: "text-amber-500 bg-amber-500/10" },
}

type SortKey = "probability" | "change24h" | "volume24h"

export function TrendingTable() {
  const { markets, isLoading } = useMarkets()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("volume24h")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return markets
      .filter((m) => !q || m.question.toLowerCase().includes(q))
      .sort((a, b) => {
        const aVal = sortBy === "change24h" ? Math.abs(a.change24h) : a[sortBy]
        const bVal = sortBy === "change24h" ? Math.abs(b.change24h) : b[sortBy]
        return sortDir === "desc" ? bVal - aVal : aVal - bVal
      })
  }, [markets, search, sortBy, sortDir])

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortDir(sortDir === "desc" ? "asc" : "desc")
    } else {
      setSortBy(column)
      setSortDir("desc")
    }
  }

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          All Markets <span className="text-sm font-normal text-muted-foreground">({markets.length})</span>
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search predictions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50"
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Prediction
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("probability")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    Probability
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("change24h")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    24h Change
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button
                    onClick={() => handleSort("volume24h")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    24h Volume
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Resolution
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                  Signal
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Loading live markets from Polymarket...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {markets.length === 0 ? "Polymarket didn't answer. Nothing is shown in its place." : "No markets match your search."}
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const isPositive = item.change24h >= 0
                const signal = signalConfig[item.signal]
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground hover:text-primary line-clamp-1 max-w-xs"
                        title="Open on Polymarket"
                      >
                        {item.question}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-bold text-primary">{formatProbability(item.probability)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`inline-flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span className="font-medium">
                          {isPositive ? "+" : ""}{item.change24h.toFixed(1)}pp
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-foreground">{formatUsd(item.volume24h)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(item.endDate)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${signal.className}`}>
                          <Zap className="w-3 h-3" />
                          {signal.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/signals?id=${item.id}`} aria-label="Open signal">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/charts?id=${item.id}`} aria-label="Open chart">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
