"use client"

import { Zap, Brain, TrendingUp, TrendingDown, Target, AlertTriangle, BarChart2, Sparkles, Activity } from "lucide-react"

interface SignalsHeaderProps {
  counts?: {
    bullish: number
    bearish: number
    contrarian: number
    neutral: number
    total: number
  }
}

const signalTypesMeta = [
  {
    type: "Bullish",
    key: "bullish" as const,
    icon: TrendingUp,
    description: "Yes price up 2pp or more in the last 24 hours",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    type: "Bearish",
    key: "bearish" as const,
    icon: TrendingDown,
    description: "Yes price down 2pp or more in the last 24 hours",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
  {
    type: "Contrarian",
    key: "contrarian" as const,
    icon: AlertTriangle,
    description: "A long shot (35% or less a day ago) jumps 5pp+, or a favourite (65%+) drops 5pp+",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    type: "Neutral",
    key: "neutral" as const,
    icon: Activity,
    description: "Moved less than 2pp in 24 hours, so no clear direction",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
  },
]

const aiCapabilities = [
  "Top 150 Polymarket crypto markets",
  "One rule for every label",
  "RSI and MACD from CoinGecko",
  "Fear & Greed from alternative.me",
  "Real price history from Polymarket's CLOB",
  "Short briefs from gpt-oss-120b on Groq",
]

export function SignalsHeader({ counts }: SignalsHeaderProps) {
  return (
    <div className="mb-10">
      {/* Main Header */}
      <div className="relative">
        {/* 3D Background Glow Effects */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-10 w-56 h-56 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/2 w-40 h-40 bg-emerald-500/6 rounded-full blur-2xl" />

        <div className="relative">
          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/40 rounded-xl blur-lg animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-primary/10 to-transparent border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 font-mono">
                Signals
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">
                <Brain className="w-3 h-3" />
                AI briefs on Groq
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20 font-mono tabular-nums">
                <Sparkles className="w-3 h-3" />
                {counts ? `${counts.total} Active` : "Loading..."}
              </span>
            </div>
          </div>

          {/* Title & Content Grid */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column - Title & Description */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Signal Analysis
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Trading signals read from <span className="text-primary font-medium">live Polymarket data</span>.
                A fixed rule labels each market from its 24h probability move, the card adds spot
                and sentiment context, and an AI model writes a short brief on top. The model never
                picks the label.
              </p>

              {/* How AI Signals Work */}
              <div className="glass-card rounded-xl p-5 border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">How Signals Work</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary font-mono">1</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Data Collection</p>
                      <p className="text-xs text-muted-foreground">Poll Polymarket&apos;s top 150 crypto markets every 30 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-emerald-400 font-mono">2</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Rule-Based Label</p>
                      <p className="text-xs text-muted-foreground">The 24h move sets the label. Size of move and volume set the confidence</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400 font-mono">3</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">AI Brief</p>
                      <p className="text-xs text-muted-foreground">When a card scrolls into view, gpt-oss-120b on Groq writes two or three sentences on it</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-2">What&apos;s behind it:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aiCapabilities.map((cap) => (
                      <span key={cap} className="text-[10px] bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Signal Type Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
                <BarChart2 className="w-4 h-4" />
                Signal Categories
              </h3>
              
              {signalTypesMeta.map((signal) => (
                <div
                  key={signal.type}
                  className="group relative"
                >
                  <div className={`absolute inset-0 ${signal.bgColor} rounded-xl translate-y-1 translate-x-0.5 opacity-30`} />
                  <div className={`relative glass-card rounded-xl p-4 border ${signal.borderColor} hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${signal.bgColor} flex items-center justify-center`}>
                          <signal.icon className={`w-5 h-5 ${signal.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${signal.color}`}>{signal.type}</h4>
                            <span className="text-xs bg-secondary/50 text-foreground px-1.5 py-0.5 rounded font-mono tabular-nums">
                              {counts ? counts[signal.key] : "—"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{signal.description}</p>
                        </div>
                      </div>
                      <Target className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Confidence Legend */}
              <div className="mt-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                <p className="text-xs text-muted-foreground mb-2 font-mono">Confidence Levels:</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-muted-foreground font-mono">High (70%+)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-muted-foreground font-mono">Medium (40-70%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                    <span className="text-[10px] text-muted-foreground font-mono">Low (0-40%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
