"use client"

import { useMemo } from "react"
import { Search, ChevronDown, TrendingUp, TrendingDown, Target, Clock, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMarkets } from "@/hooks/use-markets"
import { CATEGORIES, RESOLUTION_WINDOWS, marketCategory, resolvesWithin } from "@/lib/signals"

const categories = [
  { id: "All", label: "All", icon: "+" },
  ...CATEGORIES.map((c) => ({ id: c, label: c, icon: c[0] })),
]

const sortOptions = [
  { value: "trending", label: "Hot" },
  { value: "volume", label: "24hr Volume" },
  { value: "resolution", label: "Expiring Soon" },
  { value: "prob-high", label: "Highest Probability" },
  { value: "prob-low", label: "Lowest Probability" },
  { value: "up", label: "Movers Up" },
  { value: "down", label: "Movers Down" },
  { value: "price-range", label: "Closest to 50%" },
]

// Asset quick filters. Counts come from the live markets.
const assetIds = [
  { id: "btc", label: "BTC" },
  { id: "eth", label: "ETH" },
  { id: "sol", label: "SOL" },
  { id: "xrp", label: "XRP" },
  { id: "doge", label: "DOGE" },
  { id: "bnb", label: "BNB" },
]

interface PredictionsFiltersProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeTimeframe?: string
  setActiveTimeframe?: (timeframe: string) => void
  activeAsset?: string
  setActiveAsset?: (asset: string) => void
  directionFilter?: string
  setDirectionFilter?: (direction: string) => void
}

export function PredictionsFilters({
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  activeTimeframe = "all",
  setActiveTimeframe,
  activeAsset = "all",
  setActiveAsset,
  directionFilter = "all",
  setDirectionFilter,
}: PredictionsFiltersProps) {
  // Same SWR key as the grid, so this is not a second request
  const { markets } = useMarkets()

  const { timeframeFilters, assetFilters, categoryCounts } = useMemo(() => {
    const now = Date.now()
    const categoryCounts: Record<string, number> = { All: markets.length }
    for (const m of markets) {
      const c = marketCategory(m.question)
      categoryCounts[c] = (categoryCounts[c] ?? 0) + 1
    }
    return {
      timeframeFilters: RESOLUTION_WINDOWS.map((w) => ({
        id: w.id,
        label: w.label,
        count: markets.filter((m) => resolvesWithin(m, w.id, now)).length,
      })),
      assetFilters: assetIds.map((a) => ({
        ...a,
        count: markets.filter((m) => m.asset.toLowerCase() === a.id).length,
      })),
      categoryCounts,
    }
  }, [markets])

  return (
    <div className="space-y-5 mb-8">
      {/* Top Row: Search + Quick Filters + Sort */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search predictions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Direction Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setDirectionFilter?.("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "all"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
            }`}
          >
            <Zap className="w-3 h-3" />
            All
          </button>
          <button
            onClick={() => setDirectionFilter?.("up")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "up"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            Up
          </button>
          <button
            onClick={() => setDirectionFilter?.("down")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "down"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 border border-transparent"
            }`}
          >
            <TrendingDown className="w-3 h-3" />
            Down
          </button>
          <button
            onClick={() => setDirectionFilter?.("above")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "above"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent"
            }`}
          >
            <Target className="w-3 h-3" />
            Above 50%
          </button>
          <button
            onClick={() => setDirectionFilter?.("below")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "below"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 border border-transparent"
            }`}
          >
            <Target className="w-3 h-3" />
            Below 50%
          </button>
          <button
            onClick={() => setDirectionFilter?.("near-target")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              directionFilter === "near-target"
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 border border-transparent"
            }`}
          >
            <Clock className="w-3 h-3" />
            Near 50%
          </button>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-border/50 bg-secondary/30 gap-2 w-full lg:w-auto shrink-0">
              {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-border/50 min-w-[160px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={sortBy === option.value ? "text-primary bg-primary/10" : ""}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeframe + Asset Quick Access Row */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-secondary/20 border border-border/30">
        {/* Timeframes */}
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Resolves within</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTimeframe?.("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTimeframe === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              All
            </button>
            {timeframeFilters.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setActiveTimeframe?.(tf.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  activeTimeframe === tf.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tf.label}
                <span className={`text-[10px] px-1 py-0.5 rounded ${
                  activeTimeframe === tf.id ? "bg-primary-foreground/20" : "bg-background/50"
                }`}>
                  {tf.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset Quick Access */}
        <div className="md:border-l md:border-border/30 md:pl-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Asset</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveAsset?.("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                activeAsset === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              All
            </button>
            {assetFilters.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setActiveAsset?.(asset.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  activeAsset === asset.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {asset.label}
                <span className={`text-[10px] px-1 py-0.5 rounded ${
                  activeAsset === asset.id ? "bg-primary-foreground/20" : "bg-background/50"
                }`}>
                  {asset.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary hover:scale-102 border border-transparent hover:border-border/50"
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-current/10 flex items-center justify-center text-xs font-bold">
              {category.icon}
            </span>
            {category.label}
            <span className="text-[10px] opacity-70 tabular-nums">{categoryCounts[category.id] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
