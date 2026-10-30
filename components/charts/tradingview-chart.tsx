"use client"

import { useEffect, useRef, useState, memo, useCallback } from "react"
import { ChevronDown, Sparkles, RefreshCw, Maximize2, TrendingUp, TrendingDown, Settings, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ASSET_TV_SYMBOL, formatProbability, type Market, type SignalType } from "@/lib/signals"

const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "XRP",
  DOGE: "Dogecoin",
  BNB: "BNB",
}

const SIGNAL_STYLE: Record<SignalType, { label: string; className: string }> = {
  bullish: { label: "Bullish", className: "text-emerald-400" },
  bearish: { label: "Bearish", className: "text-red-400" },
  contrarian: { label: "Contrarian", className: "text-amber-400" },
  neutral: { label: "Neutral", className: "text-slate-400" },
}

const intervals = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
]

const chartStyles = [
  { label: "Candles", value: "1" },
  { label: "Bars", value: "0" },
  { label: "Line", value: "2" },
  { label: "Area", value: "3" },
  { label: "Heikin Ashi", value: "8" },
]

interface TradingViewChartProps {
  onAnalysisClick: () => void
  /** Markets offered in the selector, already live from Polymarket. */
  markets: Market[]
  selected: Market | null
  onSelect: (id: string) => void
}

// Main chart component with real TradingView integration
function TradingViewChartComponent({ onAnalysisClick, markets, selected, onSelect }: TradingViewChartProps) {
  const asset = selected && ASSET_TV_SYMBOL[selected.asset] ? selected.asset : "BTC"
  const symbol = ASSET_TV_SYMBOL[asset] ?? "BINANCE:BTCUSDT"
  const selectedPrediction = { symbol, asset: COIN_NAMES[asset] ?? asset }
  const [selectedInterval, setSelectedInterval] = useState("60")
  const [selectedStyle, setSelectedStyle] = useState("1")
  const [isLoading, setIsLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Load TradingView widget
  const loadWidget = useCallback(() => {
    if (!containerRef.current) return

    setIsLoading(true)

    // Clean up any existing widget
    if (widgetRef.current) {
      widgetRef.current.remove()
    }

    // Create widget container
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
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
      symbol: selectedPrediction.symbol,
      interval: selectedInterval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: selectedStyle,
      locale: "en",
      backgroundColor: "rgba(10, 10, 10, 1)",
      gridColor: "rgba(255, 255, 255, 0.04)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      withdateranges: true,
      range: selectedInterval === "D" || selectedInterval === "W" ? "12M" : "5D",
      details: false,
      hotlist: false,
      show_popup_button: false,
      studies: [
        "Volume@tv-basicstudies",
      ],
    })

    script.onload = () => {
      setTimeout(() => setIsLoading(false), 800)
    }

    widgetContainer.appendChild(script)

    return () => {
      if (widgetRef.current && containerRef.current?.contains(widgetRef.current)) {
        widgetRef.current.remove()
      }
    }
  }, [symbol, selectedInterval, selectedStyle])

  useEffect(() => {
    loadWidget()
    return () => {
      if (widgetRef.current && containerRef.current?.contains(widgetRef.current)) {
        widgetRef.current.remove()
      }
    }
  }, [loadWidget])

  const toggleFullscreen = () => {
    if (!chartContainerRef.current) return
    
    if (!isFullscreen) {
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])
  
  return (
    <div ref={chartContainerRef} className="glass-card rounded-xl overflow-hidden bg-background">
      {/* Chart Header */}
      <div className="p-4 border-b border-border/30 bg-gradient-to-r from-background via-card/50 to-background">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Prediction Selector */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 text-left hover:bg-transparent group max-w-[400px]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 line-clamp-1">
                      <span className="line-clamp-1">{selected?.question ?? "Loading live markets..."}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Coin chart: {selectedPrediction.asset} ({symbol.split(":")[1]})
                      {selected && !ASSET_TV_SYMBOL[selected.asset] ? " · this market isn't tied to one coin" : ""}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[min(450px,90vw)] max-h-[60vh] overflow-y-auto glass-card border-border/50">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Select Prediction Market
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {markets.map((pred) => (
                  <DropdownMenuItem 
                    key={pred.id}
                    onClick={() => onSelect(pred.id)}
                    className={`cursor-pointer py-2.5 ${pred.id === selected?.id ? "bg-primary/10" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{pred.question}</p>
                      <p className="text-xs text-muted-foreground">{COIN_NAMES[pred.asset] ?? "Crypto"}</p>
                    </div>
                    <span className={`ml-2 font-mono font-bold ${pred.probability >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
                      {formatProbability(pred.probability)}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Current Probability Display */}
            <div className="text-right border-l border-border/30 pl-4">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {selected ? formatProbability(selected.probability) : "..."}
              </p>
              {selected && (
                <div className={`flex items-center gap-1 justify-end ${SIGNAL_STYLE[selected.signal].className}`}>
                  {selected.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span className="text-xs font-medium">
                    {SIGNAL_STYLE[selected.signal].label} · {selected.change24h >= 0 ? "+" : ""}{selected.change24h.toFixed(1)}pp 24h
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Chart Style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 border-border/50 bg-secondary/30">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-xs">Style</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-border/50">
                {chartStyles.map((style) => (
                  <DropdownMenuItem 
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={selectedStyle === style.value ? "bg-primary/20" : ""}
                  >
                    {style.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Interval Selector */}
            <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 border border-border/30">
              {intervals.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setSelectedInterval(tf.value)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    selectedInterval === tf.value
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            
            {/* Actions */}
            <Button
              variant="ghost"
              size="icon"
              onClick={loadWidget}
              className="h-8 w-8 hover:bg-secondary/50"
              title="Refresh chart"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8 hover:bg-secondary/50"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={onAnalysisClick}
              className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground gap-1.5 shadow-lg shadow-primary/25"
            >
              <Sparkles className="w-4 h-4" />
              AI Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* TradingView Chart Area */}
      <div className="relative bg-[#0a0a0a]" style={{ height: isFullscreen ? "calc(100vh - 80px)" : "500px" }}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-10 gap-3">
            <div className="relative">
              <div className="w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Loading TradingView chart...</p>
            <p className="text-xs text-muted-foreground/60">{symbol}</p>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-full"
        />
      </div>

      {/* Chart Footer */}
      <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between bg-gradient-to-r from-background via-card/30 to-background">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live spot price
          </span>
          <span className="text-border">|</span>
          <span>Powered by TradingView</span>
        </div>
        {selected && (
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Open on Polymarket
          </a>
        )}
      </div>
    </div>
  )
}

export const TradingViewChart = memo(TradingViewChartComponent)
