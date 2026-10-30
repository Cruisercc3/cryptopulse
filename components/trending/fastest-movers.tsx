"use client"

import { useMemo } from "react"
import { Zap } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { MarketScroller } from "./market-scroller"

export function FastestMovers() {
  const { markets, isLoading } = useMarkets()
  const movers = useMemo(
    () =>
      markets
        .filter((m) => m.change24h !== 0)
        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
        .slice(0, 8),
    [markets],
  )

  return (
    <MarketScroller
      title="Fastest Movers"
      icon={<Zap className="w-5 h-5 text-amber-500" />}
      subtitle="Biggest 24h moves"
      markets={movers}
      isLoading={isLoading}
      emptyText="No market has moved in the last 24 hours."
    />
  )
}
