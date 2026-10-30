"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"
import { useMarkets, usePriceHistory } from "@/hooks/use-markets"
import { ProbabilityBars } from "@/components/probability-sparkline"
import { formatDate, formatProbability, formatUsd, type SignalType } from "@/lib/signals"

const SIGNAL_TEXT: Record<SignalType, { label: string; long: string; className: string }> = {
  bullish: { label: "Bullish", long: "Bullish Confluence", className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
  bearish: { label: "Bearish", long: "Bearish Divergence", className: "bg-red-500/10 border-red-500/20 text-red-500" },
  contrarian: { label: "Contrarian", long: "Contrarian Alert", className: "bg-amber-500/10 border-amber-500/20 text-amber-500" },
  neutral: { label: "Neutral", long: "Neutral / Low Conviction", className: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
}

/** The most traded Bitcoin market that's still in play (3% to 97%), live from Polymarket. */
export function HeroMarketCard() {
  const { markets, isLoading } = useMarkets()
  const market = useMemo(() => {
    const inPlay = markets.filter((m) => m.probability >= 3 && m.probability <= 97)
    const btc = inPlay.filter((m) => m.asset === "BTC")
    const pool = btc.length ? btc : inPlay.length ? inPlay : markets
    return [...pool].sort((a, b) => b.volume24h - a.volume24h)[0] ?? null
  }, [markets])
  const history = usePriceHistory(market?.yesTokenId ?? null, "1w")

  if (!market) {
    return (
      <div className="glass-card rounded-2xl p-6 glow-accent min-h-[380px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading the most traded Bitcoin market..." : "Polymarket didn't answer. Nothing is shown in its place."}
        </p>
      </div>
    )
  }

  const signal = SIGNAL_TEXT[market.signal]
  const isPositive = market.change24h >= 0

  return (
    <Link href={`/signals?id=${market.id}`} className="block glass-card rounded-2xl p-6 glow-accent hover:border-primary/30 transition-colors">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <span className="text-lg">₿</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Most traded today, still in play</p>
            <p className="text-sm font-medium text-foreground">{market.asset === "BTC" ? "BTC/USD" : market.asset}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${signal.className}`}>
          <Zap className="w-3 h-3" />
          <span className="text-xs font-medium">{signal.label}</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-semibold text-foreground mb-6">{market.question}</h3>

      {/* Probability */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Probability</p>
          <p className="text-5xl font-bold text-primary">{formatProbability(market.probability)}</p>
        </div>
        <div className={`flex items-center gap-1.5 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {market.change24h.toFixed(1)}pp
          </span>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </div>

      {/* 7-day Yes price */}
      <ProbabilityBars
        points={history.points}
        isLoading={history.isLoading}
        current={market.probability}
        className="h-16 mb-4"
        barClassName="bg-primary/60"
        bars={28}
      />

      {/* Volume & Resolution */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          24h Volume: <span className="text-foreground font-medium">{formatUsd(market.volume24h)}</span>
        </span>
        <span className="text-muted-foreground">
          Resolves: <span className="text-foreground">{formatDate(market.endDate)}</span>
        </span>
      </div>

      {/* Rule signal */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Signal: {signal.long}</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">LIVE · POLYMARKET</span>
        </div>
      </div>
    </Link>
  )
}
