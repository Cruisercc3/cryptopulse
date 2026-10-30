"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, ExternalLink, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProbabilityLine } from "@/components/probability-sparkline"
import { usePriceHistory } from "@/hooks/use-markets"
import { formatProbability, formatUsd, type Market } from "@/lib/signals"

function RelatedRow({ pred, onSelect }: { pred: Market; onSelect: (id: string) => void }) {
  const history = usePriceHistory(pred.yesTokenId, "1w")
  const isPositive = pred.change24h >= 0

  return (
    <button
      type="button"
      onClick={() => onSelect(pred.id)}
      className="w-full text-left block p-3 hover:bg-secondary/30 transition-all duration-200 group relative"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {pred.question}
        </p>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            {formatProbability(pred.probability)}
          </span>
          <div className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{isPositive ? "+" : ""}{pred.change24h.toFixed(1)}pp</span>
          </div>
        </div>
        <div className="w-16 h-5 shrink-0">
          <ProbabilityLine
            points={history.points}
            isLoading={history.isLoading}
            color={pred.change7d >= 0 ? "#10b981" : "#ef4444"}
            className="w-16 h-5"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <span>24h Vol: {formatUsd(pred.volume24h)}</span>
        <span className="font-mono">{pred.asset === "Other" ? "CRYPTO" : pred.asset}</span>
      </div>
    </button>
  )
}

export function RelatedPredictions({
  market,
  markets,
  onSelect,
}: {
  market: Market | null
  markets: Market[]
  onSelect: (id: string) => void
}) {
  const related = useMemo(() => {
    const others = markets.filter((m) => m.id !== market?.id)
    const sameAsset = market && market.asset !== "Other" ? others.filter((m) => m.asset === market.asset) : []
    const pool = sameAsset.length >= 3 ? sameAsset : others
    return [...pool].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5)
  }, [market, markets])

  const sameAsset = market && market.asset !== "Other" && related.every((m) => m.asset === market.asset)

  return (
    <div className="glass-card rounded-xl overflow-hidden lg:sticky lg:top-28">
      {/* Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-card/50 to-transparent">
        <h3 className="text-sm font-semibold text-foreground">Related Predictions</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sameAsset ? `Top ${market?.asset} markets by 24h volume` : "Top markets by 24h volume"}
        </p>
      </div>

      {/* Predictions List */}
      <div className="divide-y divide-border/20">
        {related.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Loading live markets...</p>
        )}
        {related.map((pred) => (
          <RelatedRow key={pred.id} pred={pred} onSelect={onSelect} />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/30 bg-secondary/20">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
          asChild
        >
          <Link href="/predictions">
            View All Predictions
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
