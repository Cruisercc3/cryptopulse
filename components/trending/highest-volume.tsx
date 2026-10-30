"use client"

import { useMemo } from "react"
import { DollarSign } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { formatUsd } from "@/lib/signals"
import { MarketScroller, ChangeChip } from "./market-scroller"

export function HighestVolume() {
  const { markets, isLoading } = useMarkets()
  const leaders = useMemo(
    () => [...markets].sort((a, b) => b.volume24h - a.volume24h).slice(0, 8),
    [markets],
  )

  return (
    <MarketScroller
      title="Highest Volume"
      icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
      subtitle="Most traded in 24h"
      markets={leaders}
      isLoading={isLoading}
      emptyText="No volume data came back from Polymarket."
      stat={(m) => (
        <div className="flex flex-col items-end gap-1">
          <div className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md">
            <span className="font-semibold">{formatUsd(m.volume24h)}</span>
          </div>
          <ChangeChip value={m.change24h} size="sm" />
        </div>
      )}
    />
  )
}
