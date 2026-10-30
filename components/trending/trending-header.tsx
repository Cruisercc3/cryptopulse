"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Zap, Clock, DollarSign, Activity, Flame, AlertCircle, BarChart2 } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { formatUsd, resolvesWithin, type Market } from "@/lib/signals"

const shortName = (m?: Market) => {
  if (!m) return "..."
  const q = m.question.replace(/^Will\s+/i, "").replace(/\?$/, "")
  return q.length > 26 ? `${q.slice(0, 24)}...` : q
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}pp`

function useTrendingStats() {
  const { markets, isLoading } = useMarkets()
  return useMemo(() => {
    const dash = isLoading || markets.length === 0
    const byMove = [...markets].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0]
    const byVolume = [...markets].sort((a, b) => b.volume24h - a.volume24h)[0]
    const byWeek = [...markets].sort((a, b) => Math.abs(b.change7d) - Math.abs(a.change7d))[0]
    const now = Date.now()
    const resolvingWeek = markets.filter((m) => resolvesWithin(m, "7d", now)).length
    const moving5 = markets.filter((m) => Math.abs(m.change24h) >= 5).length
    const volume = markets.reduce((s, m) => s + m.volume24h, 0)

    return {
      dash,
      metrics: [
        { label: "Fastest Mover (24h)", value: dash || !byMove ? "..." : signed(byMove.change24h), market: shortName(byMove), icon: Zap, color: "text-amber-400", bgColor: "bg-amber-500/10" },
        { label: "Highest Volume (24h)", value: dash || !byVolume ? "..." : formatUsd(byVolume.volume24h), market: shortName(byVolume), icon: DollarSign, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { label: "Biggest 7d Move", value: dash || !byWeek ? "..." : signed(byWeek.change7d), market: shortName(byWeek), icon: Activity, color: "text-red-400", bgColor: "bg-red-500/10" },
        { label: "Resolving in 7d", value: dash ? "..." : `${resolvingWeek} markets`, market: "Polymarket", icon: Clock, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
      ],
      categories: [
        {
          title: "Fastest Movers",
          description: "Markets with the largest probability changes in the last 24 hours. Rapid movements often signal breaking news or sentiment shifts.",
          icon: TrendingUp,
          color: "text-emerald-400",
          stats: dash ? "..." : `${moving5} moving 5pp+`,
        },
        {
          title: "Highest Volume",
          description: "Where the money is trading. High volume shows conviction behind a price.",
          icon: DollarSign,
          color: "text-primary",
          stats: dash ? "..." : `${formatUsd(volume)} in 24h`,
        },
        {
          title: "Approaching Resolution",
          description: "Markets resolving soon. These often see more activity as the outcome becomes clearer.",
          icon: Clock,
          color: "text-amber-400",
          stats: dash ? "..." : `${resolvingWeek} this week`,
        },
      ],
      up: markets.filter((m) => m.change24h > 0).length,
      down: markets.filter((m) => m.change24h < 0).length,
      total: markets.length,
      moving5,
    }
  }, [markets, isLoading])
}

export function TrendingHeader() {
  const { dash, metrics: trendingMetrics, categories: trendCategories, up, down, total, moving5 } = useTrendingStats()
  return (
    <div className="mb-10">
      {/* Main Header */}
      <div className="relative">
        {/* 3D Background Effects */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute top-0 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-amber-500/6 rounded-full blur-2xl" />

        <div className="relative">
          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/40 rounded-xl blur-lg animate-pulse" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Flame className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Trending
              </span>
              <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded-full">
                Refreshes every 30s
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">
                <Zap className="w-3 h-3" />
                {dash ? "..." : `${moving5} moving 5pp+`}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Trending Predictions
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Discover where the market&apos;s attention is focused. We track 
                <span className="text-emerald-400 font-medium"> probability momentum</span>, 
                <span className="text-primary font-medium"> volume spikes</span>, and 
                <span className="text-amber-400 font-medium"> approaching deadlines</span> to 
                surface the most actionable opportunities in real-time.
              </p>

              {/* Why Trending Matters */}
              <div className="glass-card rounded-xl p-5 border border-border/40 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Why Trending Matters</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Early Signal Detection</p>
                      <p className="text-xs text-muted-foreground">Catch momentum before mainstream awareness</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Volume Leaders</p>
                      <p className="text-xs text-muted-foreground">See where the money is trading</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Volatility Opportunities</p>
                      <p className="text-xs text-muted-foreground">Capitalize on rapid probability swings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Resolution Edge</p>
                      <p className="text-xs text-muted-foreground">Time-sensitive plays near deadlines</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Live Metrics & Categories */}
            <div className="space-y-4">
              {/* Live Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {trendingMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="group relative"
                  >
                    {/* 3D Shadow */}
                    <div className={`absolute inset-0 ${metric.bgColor} rounded-xl translate-y-1 translate-x-0.5 opacity-30`} />
                    
                    <div className="relative glass-card rounded-xl p-3.5 border border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                          <metric.icon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{metric.market}</span>
                      </div>
                      <p className="text-xl font-bold text-foreground">{metric.value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              <div className="glass-card rounded-xl p-4 border border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">Trending Categories</h3>
                </div>
                <div className="space-y-3">
                  {trendCategories.map((cat) => (
                    <div key={cat.title} className="flex items-start gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/20">
                      <cat.icon className={`w-4 h-4 ${cat.color} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground text-sm">{cat.title}</p>
                          <span className={`text-[10px] ${cat.color}`}>{cat.stats}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-secondary/40 via-secondary/20 to-secondary/40 border border-border/30">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">
              <span className="font-bold text-emerald-400">{dash ? "..." : up}</span>
              <span className="text-muted-foreground ml-1">moving up</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm">
              <span className="font-bold text-red-400">{dash ? "..." : down}</span>
              <span className="text-muted-foreground ml-1">moving down</span>
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm">
              <span className="font-bold text-amber-400">{dash ? "..." : total}</span>
              <span className="text-muted-foreground ml-1">active markets</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live from Polymarket, refreshes every 30 seconds</span>
        </div>
      </div>
    </div>
  )
}
