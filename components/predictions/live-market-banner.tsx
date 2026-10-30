"use client"

import { useCoinMarketCap, formatPrice, formatLargeNumber, deriveCMCSignal, useCMCGlobal } from "@/hooks/use-coinmarketcap"
import { TrendingUp, TrendingDown, RefreshCw, Activity, BarChart3, Coins, Globe } from "lucide-react"

export function LiveMarketBanner() {
  const { metrics, isLoading: globalLoading } = useCMCGlobal()
  const { coins, isLoading: coinsLoading, connectionStatus } = useCoinMarketCap({ limit: 10 })

  const isLoading = globalLoading || coinsLoading

  if (isLoading && !metrics && coins.length === 0) {
    return (
      <div className="mb-8 p-6 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading live market data from CoinMarketCap...</span>
        </div>
      </div>
    )
  }

  // Calculate market sentiment from top coins
  const bullishCount = coins.filter(c => c.percentChange24h > 2).length
  const bearishCount = coins.filter(c => c.percentChange24h < -2).length
  const marketSentiment = bullishCount > bearishCount ? "bullish" : 
                          bearishCount > bullishCount ? "bearish" : "neutral"

  const sentimentColors = {
    bullish: "from-emerald-500/20 via-background to-emerald-500/10",
    bearish: "from-red-500/20 via-background to-red-500/10",
    neutral: "from-slate-500/20 via-background to-slate-500/10",
  }

  return (
    <div className={`mb-8 p-6 rounded-2xl border border-border/50 bg-gradient-to-r ${sentimentColors[marketSentiment]} backdrop-blur-sm`}>
      {/* Live indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
          <span className="text-xs text-muted-foreground">
            Powered by CoinMarketCap API
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
          marketSentiment === "bullish" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" :
          marketSentiment === "bearish" ? "bg-red-500/10 text-red-500 border border-red-500/30" :
          "bg-slate-500/10 text-slate-400 border border-slate-500/30"
        }`}>
          Market: {marketSentiment}
        </div>
      </div>

      {/* Global metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Market Cap</p>
              <p className="text-lg font-bold text-foreground font-mono">
                {formatLargeNumber(metrics.totalMarketCap)}
              </p>
              <p className={`text-xs font-medium ${metrics.totalMarketCapChange24h >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {metrics.totalMarketCapChange24h >= 0 ? "+" : ""}{metrics.totalMarketCapChange24h?.toFixed(2) || 0}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-lg font-bold text-foreground font-mono">
                {formatLargeNumber(metrics.totalVolume24h)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <span className="text-orange-500 font-bold text-sm">BTC</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">BTC Dominance</p>
              <p className="text-lg font-bold text-foreground font-mono">
                {metrics.btcDominance?.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Coins</p>
              <p className="text-lg font-bold text-foreground font-mono">
                {metrics.activeCoins?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top movers ticker */}
      <div className="relative overflow-hidden rounded-xl border border-border/30 bg-background/30">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Top 10 by Market Cap</span>
        </div>
        <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
          {coins.slice(0, 10).map((coin) => {
            const isPositive = coin.percentChange24h >= 0
            const signal = deriveCMCSignal(coin.percentChange24h, coin.percentChange7d)
            
            return (
              <div
                key={coin.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background/50 border border-border/30 shrink-0 min-w-[200px] hover:border-primary/30 transition-colors"
              >
                <img
                  src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">{coin.symbol}</span>
                    <span className="text-[10px] text-muted-foreground">#{coin.rank}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground">
                      {formatPrice(coin.price)}
                    </span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? "+" : ""}{coin.percentChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
