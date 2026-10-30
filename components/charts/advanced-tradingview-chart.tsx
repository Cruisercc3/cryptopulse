"use client"

import { useEffect, useRef, memo, useState } from "react"
import { Loader2 } from "lucide-react"

interface AdvancedChartProps {
  symbol?: string
  height?: number
  className?: string
  interval?: string
  theme?: "dark" | "light"
}

// Symbol mapping from common crypto symbols to TradingView format
const SYMBOL_MAP: Record<string, string> = {
  BTC: "BINANCE:BTCUSDT",
  BTCUSD: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  ETHUSD: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  SOLUSD: "BINANCE:SOLUSDT",
  LINK: "BINANCE:LINKUSDT",
  DOT: "BINANCE:DOTUSDT",
  AAVE: "BINANCE:AAVEUSDT",
  XRP: "BINANCE:XRPUSDT",
  XRPUSD: "BINANCE:XRPUSDT",
  ADA: "BINANCE:ADAUSDT",
  AVAX: "BINANCE:AVAXUSDT",
  MATIC: "BINANCE:MATICUSDT",
  UNI: "BINANCE:UNIUSDT",
  ATOM: "BINANCE:ATOMUSDT",
  NEAR: "BINANCE:NEARUSDT",
  ARB: "BINANCE:ARBUSDT",
  OP: "BINANCE:OPUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  DOGEUSD: "BINANCE:DOGEUSDT",
  SHIB: "BINANCE:SHIBUSDT",
  PEPE: "BINANCE:PEPEUSDT",
}

export function getTradingViewSymbol(symbol: string): string {
  const upper = symbol.toUpperCase()
  if (upper.includes(":")) return upper
  return SYMBOL_MAP[upper] || `BINANCE:${upper}USDT`
}

// Full TradingView advanced chart with all features
function AdvancedChartComponent({ 
  symbol = "BINANCE:BTCUSDT", 
  height = 500,
  className = "",
  interval = "60",
  theme = "dark"
}: AdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const resolvedSymbol = getTradingViewSymbol(symbol)

  useEffect(() => {
    if (!containerRef.current) return

    setIsLoading(true)

    // Clean up any existing widget
    if (widgetRef.current) {
      widgetRef.current.remove()
    }

    // Create widget container
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = `${height}px`
    widgetContainer.style.width = "100%"
    
    const widgetDiv = document.createElement("div")
    widgetDiv.className = "tradingview-widget-container__widget"
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"
    
    widgetContainer.appendChild(widgetDiv)
    containerRef.current.appendChild(widgetContainer)
    widgetRef.current = widgetContainer

    // Create and load the TradingView script
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: resolvedSymbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1", // Candlestick style
      locale: "en",
      backgroundColor: theme === "dark" ? "rgba(10, 10, 10, 1)" : "rgba(255, 255, 255, 1)",
      gridColor: theme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      withdateranges: true,
      range: "1D",
      details: true,
      hotlist: false,
      show_popup_button: false,
      studies: [
        "Volume@tv-basicstudies",
        "MASimple@tv-basicstudies"
      ],
    })

    script.onload = () => {
      setTimeout(() => setIsLoading(false), 1000)
    }

    widgetContainer.appendChild(script)

    return () => {
      if (widgetRef.current && containerRef.current?.contains(widgetRef.current)) {
        widgetRef.current.remove()
      }
    }
  }, [resolvedSymbol, height, interval, theme])

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border/50 ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 gap-3"
          style={{ height: `${height}px` }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading TradingView chart...</p>
        </div>
      )}
      <div 
        ref={containerRef} 
        style={{ height: `${height}px` }}
      />
    </div>
  )
}

export const AdvancedTradingViewChart = memo(AdvancedChartComponent)
