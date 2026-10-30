"use client"

import { useMemo } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PredictionCard } from "./prediction-card"
import { useMarkets } from "@/hooks/use-markets"
import { marketCategory, resolvesWithin, type Market } from "@/lib/signals"

interface LivePredictionsGridProps {
  activeCategory?: string
  searchQuery?: string
  sortBy?: string
  activeTimeframe?: string
  activeAsset?: string
  directionFilter?: string
}

const endTime = (m: Market) => (m.endDate ? new Date(m.endDate).getTime() : Number.POSITIVE_INFINITY)

export function LivePredictionsGrid({
  activeCategory = "All",
  searchQuery = "",
  sortBy = "trending",
  activeTimeframe = "all",
  activeAsset = "all",
  directionFilter = "all",
}: LivePredictionsGridProps) {
  const { markets, isLoading, isValidating, error, refresh } = useMarkets()

  const withCategory = useMemo(
    () => markets.map((m) => ({ market: m, category: marketCategory(m.question) })),
    [markets],
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const now = Date.now()
    const result = withCategory.filter(({ market: m, category }) => {
      if (activeCategory !== "All" && category !== activeCategory) return false
      if (q && !m.question.toLowerCase().includes(q) && !category.toLowerCase().includes(q)) return false

      switch (directionFilter) {
        case "up":
          if (!(m.change24h > 0)) return false
          break
        case "down":
          if (!(m.change24h < 0)) return false
          break
        case "above":
          if (!(m.probability > 50)) return false
          break
        case "below":
          if (!(m.probability < 50)) return false
          break
        case "near-target":
          if (!(m.probability >= 45 && m.probability <= 55)) return false
          break
      }

      if (activeTimeframe !== "all" && !resolvesWithin(m, activeTimeframe, now)) return false
      if (activeAsset !== "all" && m.asset.toLowerCase() !== activeAsset) return false
      return true
    })

    return [...result].sort(({ market: a }, { market: b }) => {
      switch (sortBy) {
        case "volume":
        case "24hr-volume":
          return b.volume24h - a.volume24h
        case "prob-high":
          return b.probability - a.probability
        case "prob-low":
          return a.probability - b.probability
        case "resolution":
        case "hit-price":
        case "near-target":
          return endTime(a) - endTime(b)
        case "up":
          return b.change24h - a.change24h
        case "down":
          return a.change24h - b.change24h
        case "price-range":
          return Math.abs(a.probability - 50) - Math.abs(b.probability - 50)
        case "trending":
        default:
          return Math.abs(b.change24h) - Math.abs(a.change24h) || b.volume24h - a.volume24h
      }
    })
  }, [withCategory, activeCategory, searchQuery, directionFilter, activeTimeframe, activeAsset, sortBy])

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-5 w-20 bg-secondary/50 rounded" />
              <div className="h-5 w-16 bg-secondary/50 rounded-full" />
            </div>
            <div className="h-6 w-full bg-secondary/50 rounded mb-2" />
            <div className="h-6 w-3/4 bg-secondary/50 rounded mb-4" />
            <div className="h-12 w-24 bg-secondary/50 rounded mb-4" />
            <div className="h-10 w-full bg-secondary/50 rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-secondary/50 rounded" />
              <div className="h-8 flex-1 bg-secondary/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Live Polymarket data is unavailable</h3>
        <p className="text-sm text-muted-foreground">{error ?? "No markets came back."} Nothing is shown in its place.</p>
        <Button variant="outline" size="sm" onClick={refresh}>Retry</Button>
      </div>
    )
  }

  // Build active filters display
  const activeFilters: string[] = []
  if (activeCategory !== "All") activeFilters.push(activeCategory)
  if (directionFilter !== "all")
    activeFilters.push(
      directionFilter === "up"
        ? "Trending Up"
        : directionFilter === "down"
          ? "Trending Down"
          : directionFilter === "above"
            ? "Above 50%"
            : directionFilter === "below"
              ? "Below 50%"
              : "Near 50%"
    )
  if (activeTimeframe !== "all") activeFilters.push(`Resolves within ${activeTimeframe}`)
  if (activeAsset !== "all") activeFilters.push(activeAsset.toUpperCase())

  return (
    <div className="space-y-6">
      {/* Connection status and results count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length}</span> of {markets.length} predictions
            {activeFilters.length > 0 && (
              <span className="ml-2">
                {activeFilters.map((filter, i) => (
                  <span key={filter} className="inline-flex items-center">
                    {i > 0 && <span className="mx-1 text-border">+</span>}
                    <span className="text-primary font-medium">{filter}</span>
                  </span>
                ))}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground/70">
            Live from Polymarket, refreshed every 30 seconds
          </p>
        </div>

        {/* Live status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {error ? (
              <>
                <WifiOff className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last refresh failed</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Live</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isValidating}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-1">No predictions found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(({ market, category }) => (
            <PredictionCard key={market.id} market={market} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
