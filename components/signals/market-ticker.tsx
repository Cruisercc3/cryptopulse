"use client"

import { useCMCQuotes, formatPrice, formatLargeNumber, deriveCMCSignal } from "@/hooks/use-coinmarketcap"
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react"

const COIN_ICONS: Record<string, string> = {
  BTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  ETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  SOL: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  XRP: "https://s2.coinmarketcap.com/static/img/coins/64x64/52.png",
  DOGE: "https://s2.coinmarketcap.com/static/img/coins/64x64/74.png",
  BNB: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
  ADA: "https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png",
  AVAX: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
}

export function MarketTicker() {
  const { coins, isLoading, error, connectionStatus, refetch } = useCMCQuotes([
    "BTC", "ETH", "SOL", "XRP", "DOGE", "BNB", "ADA", "AVAX"
  ])

  if (isLoading && coins.length === 0) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading live market data...</span>
        </div>
      </div>
    )
  }

  if (error && coins.length === 0) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-amber-500">CoinMarketCap data unavailable</span>
          <button onClick={refetch} className="text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Live Market Data
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
            CoinMarketCap
          </span>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === "connected" ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <Wifi className="w-3 h-3 text-emerald-500" />
            </div>
          ) : (
            <WifiOff className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="relative rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm overflow-hidden">
        <div 
          className="flex gap-6 py-3 px-4 animate-ticker"
          style={{
            animation: "ticker 40s linear infinite",
          }}
        >
          {[...coins, ...coins].map((coin, idx) => {
            const isPositive = coin.percentChange24h >= 0
            const signal = deriveCMCSignal(coin.percentChange24h, coin.percentChange7d)
            const signalColors = {
              bullish: "bg-emerald-500/10 border-emerald-500/30",
              bearish: "bg-red-500/10 border-red-500/30",
              neutral: "bg-slate-500/10 border-slate-500/30",
              contrarian: "bg-amber-500/10 border-amber-500/30",
            }

            return (
              <div
                key={`${coin.symbol}-${idx}`}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${signalColors[signal]} shrink-0 transition-all hover:scale-105`}
              >
                <img
                  src={COIN_ICONS[coin.symbol] || `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                  alt={coin.name}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{coin.symbol}</span>
                    <span className="text-sm text-foreground font-mono">
                      {formatPrice(coin.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`flex items-center gap-0.5 font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? "+" : ""}{coin.percentChange24h.toFixed(2)}%
                    </span>
                    <span className="text-muted-foreground">
                      Vol: {formatLargeNumber(coin.volume24h)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          width: max-content;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export function MarketOverviewCards() {
  const { coins, isLoading, connectionStatus } = useCMCQuotes([
    "BTC", "ETH", "SOL", "XRP", "DOGE", "BNB"
  ])

  if (isLoading && coins.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-secondary/50 rounded-full" />
              <div className="h-4 w-12 bg-secondary/50 rounded" />
            </div>
            <div className="h-6 w-20 bg-secondary/50 rounded mb-1" />
            <div className="h-4 w-16 bg-secondary/50 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Market Overview</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
            LIVE
          </span>
        </div>
        {connectionStatus === "connected" && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live from CoinMarketCap
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {coins.map((coin) => {
          const isPositive = coin.percentChange24h >= 0
          const signal = deriveCMCSignal(coin.percentChange24h, coin.percentChange7d)
          
          return (
            <div
              key={coin.id}
              className="glass-card rounded-xl p-4 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={COIN_ICONS[coin.symbol] || `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
                <div>
                  <span className="font-semibold text-foreground text-sm">{coin.symbol}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">#{coin.rank}</span>
                </div>
              </div>
              
              <div className="text-lg font-bold text-foreground font-mono">
                {formatPrice(coin.price)}
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? "+" : ""}{coin.percentChange24h.toFixed(2)}%
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                  signal === "bullish" ? "bg-emerald-500/10 text-emerald-500" :
                  signal === "bearish" ? "bg-red-500/10 text-red-500" :
                  signal === "contrarian" ? "bg-amber-500/10 text-amber-500" :
                  "bg-slate-500/10 text-slate-400"
                }`}>
                  {signal}
                </span>
              </div>
              
              <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>MCap:</span>
                  <span className="font-mono text-foreground">{formatLargeNumber(coin.marketCap)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Vol:</span>
                  <span className="font-mono text-foreground">{formatLargeNumber(coin.volume24h)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
