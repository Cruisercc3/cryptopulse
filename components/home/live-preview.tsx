"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, Clock, Volume2, Wifi, WifiOff } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { formatDate, formatProbability, formatUsd, type SignalType } from "@/lib/signals"

interface LiveSignal {
  id: string
  asset: string
  question: string
  probability: number
  change: number
  signal: SignalType
  volume: string
  time: string
}

const signalColors = {
  bullish: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  bearish: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  neutral: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/30" },
  contrarian: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
}

// Helper to extract asset tag from question
function extractAssetTag(question: string): string {
  const lowerQ = question.toLowerCase()
  
  // Crypto keywords
  const cryptoMap: Record<string, string> = {
    "bitcoin": "BTC", "btc": "BTC",
    "ethereum": "ETH", "eth": "ETH",
    "solana": "SOL", "sol": "SOL",
    "xrp": "XRP", "ripple": "XRP",
    "doge": "DOGE", "dogecoin": "DOGE",
    "cardano": "ADA", "ada": "ADA",
    "avalanche": "AVAX", "avax": "AVAX",
    "chainlink": "LINK", "link": "LINK",
    "polkadot": "DOT", "dot": "DOT",
    "crypto": "CRYPTO", "defi": "DEFI", "nft": "NFT",
  }
  
  for (const [keyword, tag] of Object.entries(cryptoMap)) {
    if (lowerQ.includes(keyword)) return tag
  }
  
  // Topic-based tags for non-crypto markets
  const topicMap: Record<string, string> = {
    "trump": "POL", "biden": "POL", "president": "POL", "election": "POL",
    "congress": "GOV", "senate": "GOV", "house": "GOV",
    "fed": "FED", "rate": "FED", "inflation": "ECON",
    "stock": "STOCK", "s&p": "SPX", "nasdaq": "NDX", "dow": "DOW",
    "ai": "AI", "openai": "AI", "gpt": "AI", "artificial": "AI",
    "tesla": "TSLA", "apple": "AAPL", "google": "GOOG", "nvidia": "NVDA",
    "sports": "SPORT", "nfl": "NFL", "nba": "NBA", "mlb": "MLB",
    "war": "WAR", "ukraine": "UKR", "china": "CHN", "russia": "RUS",
  }
  
  for (const [keyword, tag] of Object.entries(topicMap)) {
    if (lowerQ.includes(keyword)) return tag
  }
  
  // Extract first meaningful word
  const words = question.split(/\s+/)
  for (const word of words) {
    const clean = word.replace(/[^a-zA-Z]/g, "")
    if (clean.length >= 3 && clean.length <= 6) {
      return clean.toUpperCase().slice(0, 4)
    }
  }
  
  return "MKT"
}

export function LivePreview() {
  const { markets, isLoading, error } = useMarkets()
  const connectionStatus = isLoading ? "connecting" : error ? "disconnected" : "connected"

  // The five markets that moved most in 24h, ties broken by volume
  const visibleSignals = useMemo((): LiveSignal[] => {
    return [...markets]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h) || b.volume24h - a.volume24h)
      .slice(0, 5)
      .map((market) => ({
        id: market.id,
        asset: extractAssetTag(market.question),
        question: market.question,
        probability: market.probability,
        change: market.change24h,
        signal: market.signal,
        volume: formatUsd(market.volume24h),
        time: `Resolves ${formatDate(market.endDate)}`,
      }))
  }, [markets])

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Description */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Watch Markets Move in Real-Time
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              See how prediction probabilities shift as new information enters the market.
              These are the five crypto markets that moved most in the last 24 hours, with the label our rule gives each one.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Probability Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor how market sentiment evolves with every trade</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Volume2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Volume Analysis</h4>
                  <p className="text-sm text-muted-foreground">Distinguish noise from conviction-driven moves</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Resolution Dates</h4>
                  <p className="text-sm text-muted-foreground">See how long each market has left to run</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Signal Feed */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
            
            <div className="relative glass-card rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Live Signal Feed</h3>
                <div className="flex items-center gap-2">
                  {connectionStatus === "connected" ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-500 font-medium">Live</span>
                    </>
                  ) : connectionStatus === "connecting" ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span className="text-xs text-amber-500">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Offline</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-[92px] rounded-xl bg-secondary/30 animate-pulse" />
                  ))}
                {!isLoading && visibleSignals.length === 0 && (
                  <div className="p-6 rounded-xl border border-border/30 text-center text-sm text-muted-foreground">
                    Polymarket didn&apos;t answer. Nothing is shown in its place.
                  </div>
                )}
                {visibleSignals.map((signal) => {
                  const colors = signalColors[signal.signal]
                  return (
                    <Link
                      key={signal.id}
                      href={`/signals?id=${signal.id}`}
                      className={`block p-4 rounded-xl border ${colors.border} ${colors.bg} transition-all duration-300 hover:ring-1 hover:ring-primary/40`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold bg-secondary/80 px-2 py-0.5 rounded text-foreground">
                              {signal.asset}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{signal.time}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{signal.question}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold transition-all duration-300 text-foreground">
                            {formatProbability(signal.probability)}
                          </p>
                          <div className={`flex items-center gap-1 ${colors.text}`}>
                            {signal.change >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span className="text-xs font-medium">
                              {signal.change > 0 ? "+" : ""}{signal.change.toFixed(1)}pp
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                        <span className={`text-xs font-medium capitalize ${colors.text}`}>{signal.signal}</span>
                        <span className="text-xs text-muted-foreground">24h Vol: {signal.volume}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
