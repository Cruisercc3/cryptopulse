"use client"

import { useMemo } from "react"
import { Clock } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { daysUntil } from "@/lib/signals"
import { MarketScroller } from "./market-scroller"

const WINDOW_DAYS = 14

export function ApproachingResolution() {
  const { markets, isLoading } = useMarkets()
  const soon = useMemo(() => {
    const now = Date.now()
    return markets
      .map((m) => ({ m, days: daysUntil(m.endDate, now) }))
      .filter((x): x is { m: (typeof markets)[number]; days: number } => x.days !== null && x.days >= 0 && x.days <= WINDOW_DAYS)
      .sort((a, b) => a.days - b.days || b.m.volume24h - a.m.volume24h)
      .slice(0, 8)
      .map((x) => x.m)
  }, [markets])

  return (
    <MarketScroller
      title="Approaching Resolution"
      icon={<Clock className="w-5 h-5 text-primary" />}
      subtitle={`Next ${WINDOW_DAYS} days`}
      markets={soon}
      isLoading={isLoading}
      emptyText={`None of the tracked markets resolve in the next ${WINDOW_DAYS} days.`}
      badge={(m) => {
        const days = daysUntil(m.endDate) ?? 0
        const urgent = days <= 7
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              urgent
                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {days <= 0 ? "today" : `${days}d left`}
          </span>
        )
      }}
    />
  )
}
