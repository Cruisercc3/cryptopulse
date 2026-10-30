"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { SignalsHeader } from "@/components/signals/signals-header"
import { SignalsList } from "@/components/signals/signals-list"
import { FearGreedGauge } from "@/components/fear-greed/fear-greed-gauge"
import { MarketOverviewCards } from "@/components/signals/market-ticker"

export default function SignalsPage() {
  const [counts, setCounts] = useState<{
    bullish: number
    bearish: number
    contrarian: number
    neutral: number
    total: number
  } | undefined>(undefined)

  return (
    <main className="min-h-screen bg-background relative">
      {/* Subtle terminal scanline texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      <Navigation />
      <div className="pt-28 pb-16 relative z-10">
        <div className="container mx-auto px-6">
          <SignalsHeader counts={counts} />

          {/* Live Market Overview from CoinMarketCap */}
          <MarketOverviewCards />

          {/* Main content + Fear & Greed sidebar */}
          <div className="flex gap-6 items-start">
            {/* Signals list — takes all available width */}
            <div className="flex-1 min-w-0">
              <SignalsList onCountsChange={setCounts} />
            </div>

            {/* Sticky Fear & Greed sidebar */}
            <div className="hidden xl:block w-72 shrink-0 sticky top-28">
              <FearGreedGauge />
            </div>
          </div>

          {/* Mobile Fear & Greed — shown below list on smaller screens */}
          <div className="xl:hidden mt-8">
            <FearGreedGauge />
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-4 rounded-lg bg-secondary/20 border border-border/30">
            <p className="text-xs text-muted-foreground text-center font-mono">
              Signals are derived from live Polymarket probability data and are not financial
              advice. Coin data from CoinMarketCap and CoinGecko, sentiment from alternative.me.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
