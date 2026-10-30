"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { TrendingUp, TrendingDown, AlertTriangle, Minus, RefreshCw, Brain, ExternalLink, ChevronDown, Activity, BarChart3, Gauge, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { useMarkets, usePriceHistory, useInView, type HistoryRange } from "@/hooks/use-markets"
import { useBrief } from "@/hooks/use-brief"
import { ProbabilityBars } from "@/components/probability-sparkline"
import {
  ASSET_COIN_ID,
  CONFIDENCE_HELP,
  countSignals,
  formatProbability,
  formatUsd,
  type Asset,
  type Market,
  type SignalType,
} from "@/lib/signals"
import type { FearGreedResponse } from "@/app/api/fear-greed/route"

type Timeframe = "24H" | "7D" | "30D"
type AssetFilter = "All" | Exclude<Asset, "Other">
type SortOption = "volume" | "probability" | "change" | "liquidity"

const signalTypeConfig: Record<SignalType, {
  label: string
  bgClass: string
  borderClass: string
  textClass: string
  barColor: string
  accentBorder: string
  icon: React.ElementType
}> = {
  bullish: {
    label: "Bullish Confluence",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/30",
    textClass: "text-emerald-500",
    barColor: "bg-emerald-500",
    accentBorder: "border-l-emerald-500",
    icon: TrendingUp,
  },
  bearish: {
    label: "Bearish Divergence",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/30",
    textClass: "text-red-500",
    barColor: "bg-red-500",
    accentBorder: "border-l-red-500",
    icon: TrendingDown,
  },
  contrarian: {
    label: "Contrarian Alert",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/30",
    textClass: "text-amber-500",
    barColor: "bg-amber-500",
    accentBorder: "border-l-amber-500",
    icon: AlertTriangle,
  },
  neutral: {
    label: "Neutral / Low Conviction",
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/30",
    textClass: "text-slate-400",
    barColor: "bg-slate-500",
    accentBorder: "border-l-slate-500",
    icon: Minus,
  },
}

const timeframes: Timeframe[] = ["24H", "7D", "30D"]
const timeframeRange: Record<Timeframe, HistoryRange> = { "24H": "1d", "7D": "1w", "30D": "1m" }
const assetFilters: AssetFilter[] = ["All", "BTC", "ETH", "SOL", "XRP", "DOGE", "BNB", "DeFi", "ETF"]

// Market data response type (/api/market-data/[coin], CoinGecko)
interface MarketData {
  rsi: number | null
  rsiLabel: "Overbought" | "Neutral" | "Oversold" | null
  macd: "bullish" | "bearish" | null
  macdValue: number | null
  currentPrice: number | null
  priceChange24h: number | null
  marketCap: number | null
  volume24h: number | null
}

const fetcher = (url: string) => fetch(url).then(res => res.ok ? res.json() : null)

// ── Saved signals (this browser only) ────────────────────────────────────────
const SAVED_KEY = "cryptopulse:saved-signals"

function readSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

function writeSaved(ids: string[]) {
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
  } catch {
    // Storage blocked. Saving still works until the page reloads.
  }
}

// ── Per-card component with per-card timeframe state ─────────────────────────
function SignalCard({
  signal,
  fearGreed,
  highlighted,
  saved,
  onToggleSave,
}: {
  signal: Market
  fearGreed: FearGreedResponse | null
  highlighted: boolean
  saved: boolean
  onToggleSave: (id: string) => void
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>("24H")
  const { ref: cardRef, inView, visible } = useInView<HTMLDivElement>("150px")

  // Live coin data for this market's asset (deduped by SWR across cards)
  const coinId = ASSET_COIN_ID[signal.asset] ?? null
  const { data: marketData, isLoading: marketLoading } = useSWR<MarketData | null>(
    coinId && inView ? `/api/market-data/${coinId}` : null,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: false }
  )

  // Real Yes-price history from Polymarket's CLOB for the selected window
  const history = usePriceHistory(signal.yesTokenId, timeframeRange[selectedTimeframe], inView)

  // AI brief, asked for once the card has stayed on screen for 700 ms
  const { brief, state: briefState } = useBrief(signal, visible, 700)

  const config = signalTypeConfig[signal.signal]
  const SignalIcon = config.icon

  const timeframeData = {
    "24H": { change: signal.change24h, volume: signal.volume24h },
    "7D": { change: signal.change7d, volume: signal.volume7d },
    "30D": { change: signal.change30d, volume: signal.volume30d },
  }
  const currentData = timeframeData[selectedTimeframe]
  const isPositive = currentData.change >= 0

  const confidenceScore = signal.confidence

  // 24h volume over the liquidity currently on the book
  const volLiqRatio = signal.liquidity > 0 ? (signal.volume24h / signal.liquidity).toFixed(1) : null

  const fg = fearGreed?.current ?? null

  return (
    <div
      ref={cardRef}
      id={`signal-${signal.id}`}
      className={`glass-card rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all duration-300 border-l-4 ${config.accentBorder} ${
        highlighted ? "ring-2 ring-primary/60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2 break-words">{signal.question}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgClass} border ${config.borderClass}`}>
              <SignalIcon className={`w-3.5 h-3.5 ${config.textClass}`} />
              <span className={`text-xs font-medium ${config.textClass}`}>{config.label}</span>
            </div>
            <div
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/50 border border-border/30 cursor-help"
              title={`Confidence: ${CONFIDENCE_HELP}`}
            >
              <span className="text-[10px] text-muted-foreground">Confidence:</span>
              <span className={`text-xs font-semibold ${
                confidenceScore >= 70 ? "text-emerald-400" :
                confidenceScore >= 40 ? "text-amber-400" : "text-slate-400"
              }`}>{confidenceScore}%</span>
            </div>
            {signal.asset !== "Other" && (
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {signal.asset}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="lg:text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Current Probability</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{formatProbability(signal.probability)}</span>
              <span
                className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}
                title={`Change over ${selectedTimeframe}, in percentage points`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? "+" : ""}{currentData.change.toFixed(1)}pp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 mb-4">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setSelectedTimeframe(tf)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedTimeframe === tf
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Market Data Indicators */}
      {coinId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {/* RSI */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/20" title={`14-day RSI for ${signal.asset}, from CoinGecko daily candles`}>
            <Activity className="w-4 h-4 text-primary/70 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{signal.asset} RSI</span>
              {marketLoading || !inView ? (
                <div className="h-4 w-12 bg-secondary/60 rounded animate-pulse" />
              ) : marketData && marketData.rsi !== null && marketData.rsi !== undefined ? (
                <span className={`text-sm font-semibold ${
                  marketData.rsiLabel === "Overbought" ? "text-red-400" :
                  marketData.rsiLabel === "Oversold" ? "text-emerald-400" : "text-foreground"
                }`}>
                  {marketData.rsi} <span className="text-[10px] font-normal text-muted-foreground">({marketData.rsiLabel ?? "N/A"})</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          {/* MACD */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/20" title={`MACD 12/26/9 for ${signal.asset}`}>
            <BarChart3 className="w-4 h-4 text-primary/70 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">MACD</span>
              {marketLoading || !inView ? (
                <div className="h-4 w-12 bg-secondary/60 rounded animate-pulse" />
              ) : marketData?.macd ? (
                <span className={`text-sm font-semibold capitalize ${
                  marketData.macd === "bullish" ? "text-emerald-400" : "text-red-400"
                }`}>
                  {marketData.macd}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          {/* 24h spot change (CoinGecko) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/20" title={`${signal.asset} spot price change over 24h, from CoinGecko`}>
            {(marketData?.priceChange24h ?? 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Spot 24h</span>
              {marketLoading || !inView ? (
                <div className="h-4 w-12 bg-secondary/60 rounded animate-pulse" />
              ) : marketData && marketData.priceChange24h !== null && marketData.priceChange24h !== undefined ? (
                <span className={`text-sm font-semibold ${
                  marketData.priceChange24h >= 0 ? "text-emerald-400" : "text-red-400"
                }`}>
                  {marketData.priceChange24h >= 0 ? "+" : ""}{marketData.priceChange24h.toFixed(2)}%
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>

          {/* Fear & Greed */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/20" title="Crypto Fear & Greed Index, alternative.me">
            <Gauge className="w-4 h-4 text-primary/70 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">F&G</span>
              {fg ? (
                <span className={`text-sm font-semibold ${
                  fg.value >= 60 ? "text-emerald-400" :
                  fg.value <= 40 ? "text-red-400" : "text-amber-400"
                }`}>
                  {fg.value} <span className="text-[10px] font-normal text-muted-foreground">({fg.classification})</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">N/A</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Volume & Liquidity Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-xs">
        <span className="text-muted-foreground">
          Vol ({selectedTimeframe}): <span className="text-foreground font-medium">{formatUsd(currentData.volume)}</span>
        </span>
        <span className="text-muted-foreground">
          Liquidity: <span className="text-foreground font-medium">{formatUsd(signal.liquidity)}</span>
        </span>
        {volLiqRatio && (
          <span className="text-muted-foreground" title="24h volume divided by the liquidity on the book">
            Vol/Liq (24h): <span className="text-foreground font-medium">{volLiqRatio}x</span>
          </span>
        )}
        {marketData?.volume24h ? (
          <span className="text-muted-foreground">
            {signal.asset} spot vol: <span className="text-foreground font-medium">{formatUsd(marketData.volume24h)}</span>
          </span>
        ) : null}
      </div>

      {/* Yes-price history (Polymarket CLOB) */}
      <ProbabilityBars
        points={history.points}
        isLoading={history.isLoading || !inView}
        current={signal.probability}
        className="h-20 mb-6"
        barClassName={config.barColor}
        emptyLabel={history.error ?? `No trades in the last ${selectedTimeframe}`}
      />

      {/* AI Analysis */}
      <div className="p-4 rounded-lg bg-secondary/20 border border-border/30 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Brain className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Analysis</span>
          {briefState === "loading" && (
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Generating...
            </span>
          )}
          {briefState === "done" && brief?.source === "model" && (
            <span className="ml-auto text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded" title="Written by gpt-oss-120b on Groq">
              Groq
            </span>
          )}
          {briefState === "done" && brief?.source === "template" && (
            <span
              className="ml-auto text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded"
              title="The AI brief didn't load, so this line is built from the numbers"
            >
              Template
            </span>
          )}
        </div>

        {briefState === "done" && brief ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{brief.text}</p>
        ) : (
          <div className="space-y-2">
            <div className="h-3 bg-secondary/60 rounded animate-pulse w-full" />
            <div className="h-3 bg-secondary/60 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-secondary/60 rounded animate-pulse w-4/6" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <a
          href={signal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View on Polymarket
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleSave(signal.id)}
          aria-pressed={saved}
          title="Saved in this browser only"
          className={`border-border/50 hover:bg-secondary/50 gap-1.5 ${saved ? "text-primary border-primary/40" : ""}`}
        >
          {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {saved ? "Saved" : "Save Signal"}
        </Button>
      </div>
    </div>
  )
}

// ── Live Status Bar ───────────────────────────────────────────────────────────
function LiveStatusBar({ refreshing }: { refreshing: boolean }) {
  const [utcTime, setUtcTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      setUtcTime(new Date().toISOString().slice(11, 19))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sticky top-20 z-20 mb-6">
      <div className="relative overflow-hidden rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm">
        {/* Scanline effect */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
          }}
        />
        <div className="relative flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-400">LIVE</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono truncate">
              Polymarket data · refreshes every 30s{refreshing ? " · updating" : ""}
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground tabular-nums shrink-0">
            UTC {utcTime}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
interface FilterBarProps {
  selectedTypes: SignalType[]
  onTypesChange: (types: SignalType[]) => void
  selectedAssets: AssetFilter[]
  onAssetsChange: (assets: AssetFilter[]) => void
  minProbability: number
  onMinProbabilityChange: (val: number) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  savedOnly: boolean
  onSavedOnlyChange: (v: boolean) => void
  savedCount: number
  visibleCount: number
  totalCount: number
}

function FilterBar({
  selectedTypes,
  onTypesChange,
  selectedAssets,
  onAssetsChange,
  minProbability,
  onMinProbabilityChange,
  sortBy,
  onSortChange,
  savedOnly,
  onSavedOnlyChange,
  savedCount,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  const allTypes: SignalType[] = ["bullish", "bearish", "contrarian", "neutral"]

  const toggleType = (type: SignalType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type))
    } else {
      onTypesChange([...selectedTypes, type])
    }
  }

  const toggleAsset = (asset: AssetFilter) => {
    if (asset === "All") {
      onAssetsChange(["All"])
      return
    }
    const withoutAll = selectedAssets.filter(a => a !== "All")
    if (selectedAssets.includes(asset)) {
      const newAssets = withoutAll.filter(a => a !== asset)
      onAssetsChange(newAssets.length === 0 ? ["All"] : newAssets)
    } else {
      onAssetsChange([...withoutAll, asset])
    }
  }

  return (
    <div className="lg:sticky lg:top-[8.5rem] z-10 mb-6">
      <div className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm p-4 space-y-4">
        {/* Signal Type Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium mr-1">Signal:</span>
          <button
            onClick={() => onTypesChange([])}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTypes.length === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {allTypes.map((type) => {
            const cfg = signalTypeConfig[type]
            const isActive = selectedTypes.includes(type)
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                  isActive
                    ? `${cfg.bgClass} ${cfg.textClass} border ${cfg.borderClass}`
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            )
          })}
          <button
            onClick={() => onSavedOnlyChange(!savedOnly)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${
              savedOnly
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            }`}
            title="Signals saved in this browser"
          >
            <Bookmark className="w-3 h-3" />
            Saved ({savedCount})
          </button>
        </div>

        {/* Asset Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium mr-1">Asset:</span>
          {assetFilters.map((asset) => {
            const isActive = selectedAssets.includes(asset) || (asset === "All" && selectedAssets.length === 0)
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {asset}
              </button>
            )
          })}
        </div>

        {/* Probability Slider + Sort + Count */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Min Prob:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minProbability}
              onChange={(e) => onMinProbabilityChange(Number(e.target.value))}
              className="w-24 h-1.5 accent-primary cursor-pointer"
              aria-label="Minimum probability"
            />
            <span className="text-xs font-mono text-foreground w-8">{minProbability}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="appearance-none bg-secondary/50 text-xs text-foreground rounded-md px-3 py-1.5 pr-7 border border-border/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                aria-label="Sort signals"
              >
                <option value="volume">Volume (24H)</option>
                <option value="probability">Probability</option>
                <option value="change">Price Change</option>
                <option value="liquidity">Liquidity</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="sm:ml-auto text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{visibleCount}</span> of <span className="font-medium text-foreground">{totalCount}</span> signals
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main list ─────────────────────────────────────────────────────────────────
export function SignalsList({ onCountsChange }: {
  onCountsChange?: (counts: { bullish: number; bearish: number; contrarian: number; neutral: number; total: number }) => void
}) {
  const { markets, isLoading, isValidating, error, refresh } = useMarkets()

  // Fetch Fear & Greed data once for all cards
  const { data: fearGreed } = useSWR<FearGreedResponse | null>(
    "/api/fear-greed",
    fetcher,
    { refreshInterval: 300000, revalidateOnFocus: false }
  )

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<SignalType[]>([])
  const [selectedAssets, setSelectedAssets] = useState<AssetFilter[]>(["All"])
  const [minProbability, setMinProbability] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>("volume")
  const [savedOnly, setSavedOnly] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [focusId, setFocusId] = useState<string | null>(null)

  useEffect(() => {
    setSavedIds(readSaved())
    // /signals?id=<market id> comes from the Analysis buttons elsewhere on the site
    const id = new URLSearchParams(window.location.search).get("id")
    if (id) setFocusId(id)
  }, [])

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      writeSaved(next)
      return next
    })
  }, [])

  // Scroll to the linked card once it exists
  useEffect(() => {
    if (!focusId || markets.length === 0) return
    const el = document.getElementById(`signal-${focusId}`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [focusId, markets.length])

  // Filtered & sorted markets
  const filteredMarkets = useMemo(() => {
    let result = markets

    if (savedOnly) {
      result = result.filter(s => savedIds.includes(s.id))
    }

    // Filter by signal type
    if (selectedTypes.length > 0) {
      result = result.filter(s => selectedTypes.includes(s.signal))
    }

    // Filter by asset
    if (!selectedAssets.includes("All") && selectedAssets.length > 0) {
      result = result.filter(s => (selectedAssets as string[]).includes(s.asset))
    }

    // Filter by min probability
    result = result.filter(s => s.probability >= minProbability)

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.volume24h - a.volume24h
        case "probability":
          return b.probability - a.probability
        case "change":
          return Math.abs(b.change24h) - Math.abs(a.change24h)
        case "liquidity":
          return b.liquidity - a.liquidity
        default:
          return 0
      }
    })

    return result
  }, [markets, selectedTypes, selectedAssets, minProbability, sortBy, savedOnly, savedIds])

  // Notify parent of live counts whenever markets change
  const counts = useMemo(() => countSignals(markets), [markets])

  useEffect(() => {
    onCountsChange?.(counts)
  }, [counts, onCountsChange])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Fetching live signals from Polymarket...</p>
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
        <p className="text-foreground font-medium">Could not load live signals</p>
        <p className="text-muted-foreground text-sm">{error ?? "No markets returned."}</p>
        <Button variant="outline" size="sm" onClick={refresh}>Retry</Button>
      </div>
    )
  }

  return (
    <div>
      <LiveStatusBar refreshing={isValidating} />
      <FilterBar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedAssets={selectedAssets}
        onAssetsChange={setSelectedAssets}
        minProbability={minProbability}
        onMinProbabilityChange={setMinProbability}
        sortBy={sortBy}
        onSortChange={setSortBy}
        savedOnly={savedOnly}
        onSavedOnlyChange={setSavedOnly}
        savedCount={savedIds.length}
        visibleCount={filteredMarkets.length}
        totalCount={markets.length}
      />
      <div className="space-y-6">
        {filteredMarkets.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            fearGreed={fearGreed ?? null}
            highlighted={signal.id === focusId}
            saved={savedIds.includes(signal.id)}
            onToggleSave={toggleSave}
          />
        ))}
        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {savedOnly && savedIds.length === 0 ? "No saved signals yet." : "No signals match your filters."}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSelectedTypes([])
                setSelectedAssets(["All"])
                setMinProbability(0)
                setSavedOnly(false)
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
