"use client"

import { memo, useState } from "react"
import { Loader2 } from "lucide-react"

interface MiniTradingViewChartProps {
  symbol?: string
  height?: number
  interval?: string
  className?: string
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

export function getMiniTradingViewSymbol(symbol: string): string {
  const upper = symbol.toUpperCase()
  if (upper.includes(":")) return upper
  return SYMBOL_MAP[upper] || `BINANCE:${upper}USDT`
}

// Mini TradingView chart using iframe embed - more lightweight
function MiniTradingViewChartComponent({ 
  symbol = "BINANCE:BTCUSDT", 
  height = 300,
  interval = "60",
  className = ""
}: MiniTradingViewChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  const resolvedSymbol = getMiniTradingViewSymbol(symbol)
  
  // Build TradingView embed URL with parameters for mini chart
  const embedUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tv_embed&symbol=${encodeURIComponent(resolvedSymbol)}&interval=${interval}&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0a0a0a&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=0&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart`

  return (
    <div 
      className={`relative overflow-hidden rounded-lg border border-border/30 bg-card/50 ${className}`}
      style={{ height: `${height}px` }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      <iframe
        src={embedUrl}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="autoplay; fullscreen"
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        title={`TradingView mini chart for ${resolvedSymbol}`}
      />
    </div>
  )
}

export const MiniTradingViewChart = memo(MiniTradingViewChartComponent)
