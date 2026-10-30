"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BarChart3, 
  Bell, 
  Shield, 
  Clock,
  Target,
  Layers,
  Cpu,
  Wifi
} from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { countSignals, formatProbability, formatUsd, type Market, type SignalType } from "@/lib/signals"

const signalTypes: Array<{ id: SignalType; label: string; icon: typeof TrendingUp; color: string; description: string }> = [
  {
    id: "bullish",
    label: "Bullish Signals",
    icon: TrendingUp,
    color: "emerald",
    description: "Yes price up 2pp or more in 24 hours",
  },
  {
    id: "bearish",
    label: "Bearish Signals",
    icon: TrendingDown,
    color: "red",
    description: "Yes price down 2pp or more in 24 hours",
  },
  {
    id: "contrarian",
    label: "Contrarian Alerts",
    icon: Zap,
    color: "amber",
    description: "A long shot jumps 5pp+, or a favourite drops 5pp+, against the crowd",
  },
  {
    id: "neutral",
    label: "Neutral / Ranging",
    icon: Activity,
    color: "slate",
    description: "Moved less than 2pp in 24 hours, waiting for direction",
  },
]

const dataFeeds = [
  {
    name: "Polymarket Gamma API",
    status: "live",
    latency: "every 30s",
    description: "The top crypto markets by volume: odds, 24h/7d/30d moves, volume, liquidity",
  },
  {
    name: "Polymarket CLOB",
    status: "live",
    latency: "cached 5 min",
    description: "Yes-price history behind every sparkline and probability chart",
  },
  {
    name: "CoinGecko + CoinMarketCap",
    status: "live",
    latency: "every 30 to 60s",
    description: "Spot prices, 24h change, RSI and MACD from daily candles, global market metrics",
  },
  {
    name: "Fear & Greed Index",
    status: "live",
    latency: "every 5 min",
    description: "Market-wide sentiment score from alternative.me, with 30 days of history",
  },
]

const platformFeatures = [
  {
    icon: Target,
    title: "Precision Filtering",
    description: "Filter by signal, asset, direction, probability range and time to resolution. Find exactly the signals that match your strategy.",
  },
  {
    icon: Bell,
    title: "Saved Signals",
    description: "Save the signals you want to follow. They stay in your browser and get their own filter.",
  },
  {
    icon: Shield,
    title: "Market Context",
    description: "Every card shows its coin's RSI, MACD and 24h spot move, plus the Fear & Greed reading and the market's liquidity.",
  },
  {
    icon: Clock,
    title: "Probability History",
    description: "Track how predictions evolve over 24 hours, 7 days or 30 days, straight from Polymarket's order book history.",
  },
  {
    icon: Layers,
    title: "Multi-Source Context",
    description: "Prediction market odds next to spot prices, technicals and a sentiment index, on one card.",
  },
  {
    icon: Cpu,
    title: "AI Interpretation",
    description: "gpt-oss-120b on Groq writes a short brief per card. A fixed rule sets the label, never the model.",
  },
]

function example(markets: Market[], type: SignalType): string {
  const m = markets
    .filter((x) => x.signal === type)
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h) || b.volume24h - a.volume24h)[0]
  if (!m) return "None right now"
  const sign = m.change24h > 0 ? "+" : ""
  return `${m.question} ${formatProbability(m.probability)}, ${sign}${m.change24h.toFixed(1)}pp on ${formatUsd(m.volume24h)}`
}

export function SignalPlatform() {
  const [activeSignalType, setActiveSignalType] = useState<SignalType>("bullish")
  const { markets, isLoading } = useMarkets()
  const dash = isLoading || markets.length === 0

  const counts = useMemo(() => countSignals(markets), [markets])
  const liveMetrics = useMemo(() => {
    const volume = markets.reduce((sum, m) => sum + m.volume24h, 0)
    const liquidity = markets.reduce((sum, m) => sum + m.liquidity, 0)
    const active = counts.bullish + counts.bearish + counts.contrarian
    return [
      { label: "Live Crypto Markets", value: dash ? "..." : String(markets.length), change: "top 150 by volume" },
      { label: "Active Signals", value: dash ? "..." : String(active), change: "bullish, bearish or contrarian" },
      { label: "Volume Tracked", value: dash ? "..." : formatUsd(volume), change: "last 24h" },
      { label: "Liquidity on Book", value: dash ? "..." : formatUsd(liquidity), change: "across these markets" },
    ]
  }, [markets, counts, dash])

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      
      <div className="container mx-auto px-6 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Wifi className="w-3.5 h-3.5" />
            Live Signal Platform
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Every Signal. Every Market. Real-Time.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prediction market moves turned into labelled signals, with spot, technical and sentiment context and a short AI brief on each.
          </p>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {liveMetrics.map((metric) => (
            <div key={metric.label} className="glass-card rounded-xl p-4 text-center">
              <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{metric.value}</p>
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              <p className="text-xs text-primary font-medium">{metric.change}</p>
            </div>
          ))}
        </div>

        {/* Signal Types Grid */}
        <div className="mb-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h3 className="text-xl font-semibold text-foreground">Signal Classification</h3>
            <Link href="/signals" className="text-sm text-primary hover:text-primary/80">See all live signals</Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {signalTypes.map((signal) => {
              const isActive = activeSignalType === signal.id
              const colorClasses = {
                emerald: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
                red: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10",
                amber: "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10",
                slate: "border-border/50 bg-secondary/30 hover:bg-secondary/50",
              }
              const iconColors = {
                emerald: "text-emerald-500",
                red: "text-red-500",
                amber: "text-amber-500",
                slate: "text-muted-foreground",
              }
              
              return (
                <button
                  key={signal.id}
                  onClick={() => setActiveSignalType(signal.id)}
                  className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                    colorClasses[signal.color as keyof typeof colorClasses]
                  } ${isActive ? "ring-2 ring-primary/50 scale-[1.02]" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <signal.icon className={`w-5 h-5 ${iconColors[signal.color as keyof typeof iconColors]}`} />
                    <span className="text-xs font-bold bg-secondary/50 px-2 py-0.5 rounded-full text-foreground">
                      {dash ? "..." : counts[signal.id]}
                    </span>
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{signal.label}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{signal.description}</p>
                  <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                    <p className="text-xs text-muted-foreground italic line-clamp-2">{dash ? "Loading live example..." : example(markets, signal.id)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Data Feeds Status */}
        <div className="mb-20">
          <h3 className="text-xl font-semibold text-foreground mb-6">Live Data Feeds</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {dataFeeds.map((feed) => (
              <div key={feed.name} className="glass-card rounded-xl p-5 flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-foreground">{feed.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-500 font-medium uppercase">{feed.status}</span>
                      <span className="text-xs text-muted-foreground">{feed.latency}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feed.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Features Grid */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Platform Capabilities</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature) => (
              <div key={feature.title} className="group p-6 rounded-2xl border border-border/30 bg-secondary/10 hover:bg-secondary/20 hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
