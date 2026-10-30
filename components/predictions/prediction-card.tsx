"use client"

import Link from "next/link"
import useSWR from "swr"
import { TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProbabilityLine } from "@/components/probability-sparkline"
import { useInView, usePriceHistory } from "@/hooks/use-markets"
import { ASSET_COIN_ID, formatDate, formatProbability, formatUsd, type Market } from "@/lib/signals"

const signalConfig = {
  bullish: {
    label: "Bullish",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    textClass: "text-emerald-500",
  },
  bearish: {
    label: "Bearish",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    textClass: "text-red-500",
  },
  neutral: {
    label: "Neutral",
    bgClass: "bg-muted",
    borderClass: "border-border/30",
    textClass: "text-muted-foreground",
  },
  contrarian: {
    label: "Contrarian",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    textClass: "text-amber-500",
  },
}

interface CoinData {
  rsi: number | null
  macd: "bullish" | "bearish" | null
  priceChange24h: number | null
}

const fetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null))

export function PredictionCard({ market, category }: { market: Market; category: string }) {
  const { ref, inView } = useInView<HTMLDivElement>("200px")
  const history = usePriceHistory(market.yesTokenId, "1w", inView)
  const coinId = ASSET_COIN_ID[market.asset] ?? null
  const { data: coin } = useSWR<CoinData | null>(
    coinId && inView ? `/api/market-data/${coinId}` : null,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false },
  )

  const signalStyle = signalConfig[market.signal]
  const change = market.change24h
  const isPositive = change >= 0
  const yes = Math.round(market.probability)
  const lineColor = market.change7d > 0 ? "#10b981" : market.change7d < 0 ? "#ef4444" : "#64748b"

  return (
    <div ref={ref} className="group glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 flex flex-col">
      {/* Header with signal badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded">
            {category}
          </span>
          <span className="flex items-center gap-1 text-xs text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${signalStyle.bgClass} border ${signalStyle.borderClass}`}
        >
          <Zap className={`w-3 h-3 ${signalStyle.textClass}`} />
          <span className={`text-xs font-medium ${signalStyle.textClass}`}>
            {signalStyle.label}
          </span>
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-foreground mb-4 leading-snug line-clamp-2 flex-grow">
        {market.question}
      </h3>

      {/* Probability and Change */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Probability</p>
          <p className="text-4xl font-bold transition-all duration-300 text-primary">
            {formatProbability(market.probability)}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}
          title="Change in the Yes price over 24 hours, in percentage points"
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {change.toFixed(1)}pp
          </span>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
      </div>

      {/* 7-day Yes-price history from Polymarket's CLOB */}
      <div className="h-10 mb-3 rounded-md bg-secondary/30 px-1.5 py-1" title="Yes price over the last 7 days">
        <ProbabilityLine
          points={history.points}
          isLoading={history.isLoading || !inView}
          color={lineColor}
          className="w-full h-8"
        />
      </div>

      {/* Yes/No Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-emerald-500 font-medium">Yes {yes}%</span>
          <span className="text-red-400 font-medium">No {100 - yes}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-red-500/30 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${yes}%` }}
          />
        </div>
      </div>

      {/* Coin context for markets tied to a coin (CoinGecko) */}
      {coinId && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              coin?.rsi != null && coin.rsi > 70 ? "bg-red-500/10 text-red-500" :
              coin?.rsi != null && coin.rsi < 30 ? "bg-emerald-500/10 text-emerald-500" :
              "bg-secondary/50 text-muted-foreground"
            }`}
            title={`${market.asset} 14-day RSI`}
          >
            <span className="font-medium">{market.asset} RSI</span>
            <span>{coin?.rsi != null ? coin.rsi : "..."}</span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              coin?.macd === "bullish" ? "bg-emerald-500/10 text-emerald-500" :
              coin?.macd === "bearish" ? "bg-red-500/10 text-red-500" :
              "bg-secondary/50 text-muted-foreground"
            }`}
            title={`${market.asset} MACD 12/26/9`}
          >
            <span className="font-medium">MACD</span>
            <span>{coin?.macd === "bullish" ? "+" : coin?.macd === "bearish" ? "-" : "..."}</span>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md ${
              coin?.priceChange24h == null ? "bg-secondary/50 text-muted-foreground" :
              coin.priceChange24h >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            }`}
            title={`${market.asset} spot price change over 24h`}
          >
            <span className="font-medium">Spot</span>
            <span>
              {coin?.priceChange24h == null
                ? "..."
                : `${coin.priceChange24h >= 0 ? "+" : ""}${coin.priceChange24h.toFixed(1)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Volume and Resolution */}
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-4">
        <span>
          24h Vol: <span className="text-foreground font-medium">{formatUsd(market.volume24h)}</span>
        </span>
        <span>
          Resolves: <span className="text-foreground">{formatDate(market.endDate)}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/signals?id=${market.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border/50 hover:bg-secondary/50 gap-1.5 text-xs"
          >
            <Zap className="w-3 h-3" />
            Analysis
          </Button>
        </Link>
        <Link href={`/charts?id=${market.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-border/50 hover:bg-secondary/50 gap-1.5 text-xs"
          >
            <BarChart3 className="w-3 h-3" />
            Chart
          </Button>
        </Link>
      </div>
    </div>
  )
}
