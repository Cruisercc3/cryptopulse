"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Target, Clock, DollarSign } from "lucide-react"
import { FearGreedGauge } from "@/components/fear-greed/fear-greed-gauge"
import { useMarkets } from "@/hooks/use-markets"
import { formatUsd, resolvesWithin } from "@/lib/signals"

function useQuickStats() {
  const { markets, isLoading } = useMarkets()
  return useMemo(() => {
    const dash = isLoading || markets.length === 0
    const volume = markets.reduce((s, m) => s + m.volume24h, 0)
    const avg = markets.length ? markets.reduce((s, m) => s + m.probability, 0) / markets.length : 0
    const now = Date.now()
    return {
      quickStats: [
        { label: "Active Markets", value: dash ? "..." : String(markets.length), icon: Activity, color: "text-primary" },
        { label: "24h Volume", value: dash ? "..." : formatUsd(volume), icon: DollarSign, color: "text-emerald-400" },
        { label: "Avg. Probability", value: dash ? "..." : `${Math.round(avg)}%`, icon: Target, color: "text-amber-400" },
        { label: "Resolving in 7d", value: dash ? "..." : String(markets.filter((m) => resolvesWithin(m, "7d", now)).length), icon: Clock, color: "text-cyan-400" },
      ],
      up: markets.filter((m) => m.change24h > 0).length,
      down: markets.filter((m) => m.change24h < 0).length,
      bigMoves: markets.filter((m) => Math.abs(m.change24h) >= 5).length,
      dash,
    }
  }, [markets, isLoading])
}

const keyInsights = [
  {
    title: "What Are Prediction Markets?",
    description: "Decentralized platforms where traders bet on future outcomes. Prices reflect collective probability estimates, often more accurate than traditional polls or expert opinions.",
  },
  {
    title: "How Probabilities Work",
    description: "A 72% probability means traders believe there's a 72% chance the event occurs. These shift in real-time as new information enters the market.",
  },
  {
    title: "Trading Signals",
    description: "A fast move in a market's odds often means news or a shift in sentiment. Each card is labelled by one fixed rule on its 24h move, the same rule the Signals page uses.",
  },
]

export function PredictionsHeader() {
  const { quickStats, up, down, bigMoves, dash } = useQuickStats()
  return (
    <div className="mb-10">
      {/* Title Section with 3D effect */}
      <div className="relative">
        {/* Background glow effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -top-5 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Main Title */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full">
                  Predictions
                </span>
                <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Crypto Prediction Markets
              </span>
            </h1>
            
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              Real-time probability data from <span className="text-primary font-medium">Polymarket</span> — 
              the world&apos;s largest prediction market. Filter by asset, timeframe, and direction to find 
              high-conviction trading opportunities backed by collective market intelligence.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative glass-card rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {keyInsights.map((insight, idx) => (
          <div
            key={insight.title}
            className="relative group"
          >
            {/* 3D shadow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 to-secondary/20 rounded-xl translate-y-1 translate-x-0.5 opacity-50" />
            
            <div className="relative glass-card rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{idx + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Indicator Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">{dash ? "..." : up}</span> up 24h
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-muted-foreground">
              <span className="text-red-400 font-medium">{dash ? "..." : down}</span> down 24h
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground">
              <span className="text-amber-400 font-medium">{dash ? "..." : bigMoves}</span> moved 5pp+
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FearGreedGauge compact />
          <span className="text-[10px] text-muted-foreground hidden sm:block">Updated every 30 seconds</span>
        </div>
      </div>
    </div>
  )
}
