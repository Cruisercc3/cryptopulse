"use client"

import { useRef, type ReactNode } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatProbability, formatUsd, type Market } from "@/lib/signals"

interface MarketScrollerProps {
  title: string
  icon: ReactNode
  subtitle?: string
  markets: Market[]
  isLoading: boolean
  emptyText: string
  /** Top-right badge on each card. */
  badge?: (m: Market) => ReactNode
  /** Right-hand stat under the probability. */
  stat?: (m: Market) => ReactNode
}

export function ChangeChip({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const isPositive = value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  return (
    <div
      className={`flex items-center gap-1 rounded-md ${size === "md" ? "px-2 py-1" : "text-xs"} ${
        isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      }`}
      title="24h change in percentage points"
    >
      <Icon className={size === "md" ? "w-4 h-4" : "w-3 h-3"} />
      <span className="font-semibold">
        {isPositive ? "+" : ""}
        {value.toFixed(1)}pp
      </span>
    </div>
  )
}

export function MarketScroller({ title, icon, subtitle, markets, isLoading, emptyText, badge, stat }: MarketScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" })
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {subtitle && <span className="text-sm text-muted-foreground hidden sm:inline">{subtitle}</span>}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8 border-border/50" onClick={() => scroll("left")} aria-label={`Scroll ${title} left`}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-border/50" onClick={() => scroll("right")} aria-label={`Scroll ${title} right`}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 h-[132px] rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        {!isLoading && markets.length === 0 && (
          <div className="w-full glass-card rounded-xl p-6 text-sm text-muted-foreground text-center">{emptyText}</div>
        )}
        {markets.map((m) => (
          <Link key={m.id} href={`/charts?id=${m.id}`} className="flex-shrink-0 w-72 max-w-[85vw] snap-start">
            <div className="glass-card rounded-xl p-4 h-full hover:border-primary/30 transition-all group relative overflow-hidden">
              {badge && <div className="absolute top-3 right-3">{badge(m)}</div>}
              <p className={`text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 min-h-[40px] ${badge ? "pr-16" : ""}`}>
                {m.question}
              </p>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-3xl font-bold text-primary">{formatProbability(m.probability)}</p>
                  <p className="text-xs text-muted-foreground">24h Vol: {formatUsd(m.volume24h)}</p>
                </div>
                {stat ? stat(m) : <ChangeChip value={m.change24h} />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
