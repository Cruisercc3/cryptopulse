"use client"

import { Sparkles, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { useBrief } from "@/hooks/use-brief"
import { CONFIDENCE_HELP, formatUsd, type Market } from "@/lib/signals"

interface AiAnalysisPanelProps {
  isOpen: boolean
  market: Market | null
}

function Change({ label, value }: { label: string; value: number }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <div className="bg-secondary/30 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${up ? "text-emerald-500" : "text-red-500"}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${up ? "text-emerald-500" : "text-red-500"}`}>
        {up ? "+" : ""}
        {value.toFixed(1)}pp
      </p>
    </div>
  )
}

export function AiAnalysisPanel({ isOpen, market }: AiAnalysisPanelProps) {
  const { brief, state } = useBrief(market, isOpen)

  if (!isOpen || !market) return null

  const confidenceLabel = market.confidence >= 70 ? "High" : market.confidence >= 40 ? "Medium" : "Low"

  return (
    <div className="glass-card rounded-xl p-5 border-l-2 border-l-primary animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">AI Analysis</h3>
          <p className="text-xs text-muted-foreground truncate">{market.question}</p>
        </div>
        {state === "done" && brief?.source === "model" && (
          <span className="ml-auto text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded" title="Written by gpt-oss-120b on Groq">
            Groq
          </span>
        )}
        {state === "done" && brief?.source === "template" && (
          <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded" title="The AI brief didn't load, so this line is built from the numbers">
            Template
          </span>
        )}
      </div>

      <div className="space-y-4">
        {state !== "done" || !brief ? (
          <div className="space-y-3">
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-5/6" />
          </div>
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed">{brief.text}</p>
        )}

        {/* Key numbers, all live from Polymarket */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Change label="24h Change" value={market.change24h} />
          <Change label="7d Change" value={market.change7d} />
          <div className="bg-secondary/30 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">24h Volume</span>
            </div>
            <p className="text-lg font-semibold text-foreground">{formatUsd(market.volume24h)}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3" title={`Confidence: ${CONFIDENCE_HELP}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Confidence</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {confidenceLabel} <span className="text-sm text-muted-foreground">{market.confidence}%</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60 italic">
          The label comes from a fixed rule on the 24h move. The brief is AI-written from the numbers above. Not financial advice.
        </p>
      </div>
    </div>
  )
}
