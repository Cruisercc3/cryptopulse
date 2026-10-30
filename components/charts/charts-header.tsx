"use client"

import useSWR from "swr"
import { BarChart3, LineChart, CandlestickChart, TrendingUp, Activity, Layers, Zap, Eye } from "lucide-react"
import { ASSET_COIN_ID, type Market } from "@/lib/signals"
import type { FearGreedResponse } from "@/app/api/fear-greed/route"

const fetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null))

const chartFeatures = [
  {
    icon: CandlestickChart,
    title: "TradingView Integration",
    description: "Candlestick charts of the market's coin, streamed live by TradingView",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: LineChart,
    title: "Probability Tracking",
    description: "The market's Yes price over time, from Polymarket's order book",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Layers,
    title: "Multi-Timeframe",
    description: "Probability history over 24H, 7D, 30D and all time",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Zap,
    title: "AI Analysis",
    description: "One click for a short AI brief on the selected market",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
]

interface CoinData {
  rsi: number | null
  rsiLabel: string | null
  macd: "bullish" | "bearish" | null
  priceChange24h: number | null
}

export function ChartsHeader({ market }: { market: Market | null }) {
  const asset = market && ASSET_COIN_ID[market.asset] ? market.asset : "BTC"
  const coinId = ASSET_COIN_ID[asset] ?? "bitcoin"
  const { data: coin } = useSWR<CoinData | null>(`/api/market-data/${coinId}`, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  })
  const { data: fg } = useSWR<FearGreedResponse | null>("/api/fear-greed", fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: false,
  })

  const marketIndicators = [
    {
      label: `${asset} RSI (14d)`,
      value: coin?.rsi != null ? `${coin.rsi}` : "...",
      trend: coin?.rsi == null ? "stable" : coin.rsi > 55 ? "up" : coin.rsi < 45 ? "down" : "stable",
    },
    {
      label: `${asset} MACD`,
      value: coin?.macd ? (coin.macd === "bullish" ? "Bullish" : "Bearish") : "...",
      trend: coin?.macd === "bullish" ? "up" : coin?.macd === "bearish" ? "down" : "stable",
    },
    {
      label: `${asset} Spot 24h`,
      value: coin?.priceChange24h != null ? `${coin.priceChange24h >= 0 ? "+" : ""}${coin.priceChange24h.toFixed(2)}%` : "...",
      trend: coin?.priceChange24h == null ? "stable" : coin.priceChange24h >= 0 ? "up" : "down",
    },
    {
      label: "Fear & Greed",
      value: fg?.current ? `${fg.current.value} ${fg.current.classification}` : "...",
      trend: !fg?.current ? "stable" : fg.current.value >= 55 ? "up" : fg.current.value <= 45 ? "down" : "stable",
    },
  ]

  return (
    <div className="mb-8">
      {/* Main Header Section */}
      <div className="relative">
        {/* 3D Background Effects */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/8 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl" />

        <div className="relative">
          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md animate-pulse" />
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                Probability Charts
              </span>
              <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded-full">
                TradingView Powered
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
                <Eye className="w-3 h-3" />
                Real-time
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                Prediction Charts
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Pick a live Polymarket market and see two things side by side: the coin&apos;s spot 
                price on a <span className="text-primary font-medium">TradingView</span> chart, and the 
                market&apos;s own probability history from Polymarket. One click adds an AI brief.
              </p>
              
              {/* What You'll Learn */}
              <div className="glass-card rounded-xl p-4 border border-border/40">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  How Probability Charts Work
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>The TradingView chart shows the coin&apos;s spot price, candle by candle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>The probability chart shows the market&apos;s Yes price over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span>Green means the Yes price rose over the window, red that it fell</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>Volume bars on the coin chart show how much traded behind each move</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3">
              {chartFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative"
                >
                  {/* 3D Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 to-secondary/20 rounded-xl translate-y-1.5 translate-x-0.5 opacity-40" />
                  
                  <div className="relative glass-card rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full">
                    <div className={`w-9 h-9 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market Indicators Bar */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {marketIndicators.map((indicator) => (
          <div
            key={indicator.label}
            className="glass-card rounded-lg p-3 border border-border/30 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{indicator.label}</p>
              <p className="text-lg font-bold text-foreground">{indicator.value}</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              indicator.trend === "up" ? "bg-emerald-500/10" : 
              indicator.trend === "down" ? "bg-red-500/10" : "bg-amber-500/10"
            }`}>
              <TrendingUp className={`w-3 h-3 ${
                indicator.trend === "up" ? "text-emerald-400" : 
                indicator.trend === "down" ? "text-red-400 rotate-180" : "text-amber-400"
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
