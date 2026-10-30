"use client"

import { useState, useEffect, useRef, memo } from "react"
import { Grid2X2, Grid3X3, LayoutGrid, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChartConfig {
  symbol: string
  name: string
  interval: string
}

const defaultCharts: ChartConfig[] = [
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", interval: "60" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", interval: "60" },
  { symbol: "BINANCE:SOLUSDT", name: "Solana", interval: "60" },
  { symbol: "BINANCE:XRPUSDT", name: "XRP", interval: "60" },
]

const availableSymbols = [
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin (BTC)" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum (ETH)" },
  { symbol: "BINANCE:SOLUSDT", name: "Solana (SOL)" },
  { symbol: "BINANCE:XRPUSDT", name: "XRP" },
  { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin (DOGE)" },
  { symbol: "BINANCE:LINKUSDT", name: "Chainlink (LINK)" },
  { symbol: "BINANCE:AVAXUSDT", name: "Avalanche (AVAX)" },
  { symbol: "BINANCE:ADAUSDT", name: "Cardano (ADA)" },
  { symbol: "BINANCE:DOTUSDT", name: "Polkadot (DOT)" },
]

const layouts = [
  { id: "2x1", icon: Grid2X2, cols: 2, rows: 1, count: 2 },
  { id: "2x2", icon: Grid3X3, cols: 2, rows: 2, count: 4 },
  { id: "3x2", icon: LayoutGrid, cols: 3, rows: 2, count: 6 },
]

interface MiniChartProps {
  symbol: string
  name: string
  interval: string
  height: number
  onChangeSymbol: (symbol: string, name: string) => void
}

function MiniChart({ symbol, name, interval, height, onChangeSymbol }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return
    setIsLoading(true)

    // Clean up
    if (widgetRef.current) {
      widgetRef.current.remove()
    }

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

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(10, 10, 10, 1)",
      gridColor: "rgba(255, 255, 255, 0.03)",
      hide_top_toolbar: true,
      hide_legend: true,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: "https://www.tradingview.com",
      withdateranges: false,
      range: "1D",
      details: false,
      hotlist: false,
      show_popup_button: false,
    })

    script.onload = () => setTimeout(() => setIsLoading(false), 600)
    widgetContainer.appendChild(script)

    return () => {
      if (widgetRef.current && containerRef.current?.contains(widgetRef.current)) {
        widgetRef.current.remove()
      }
    }
  }, [symbol, interval])

  return (
    <div className="relative rounded-lg border border-border/30 overflow-hidden bg-[#0a0a0a] group">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 bg-gradient-to-b from-background/90 to-transparent flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs font-medium gap-1 hover:bg-secondary/50"
            >
              {name}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="glass-card border-border/50">
            {availableSymbols.map((s) => (
              <DropdownMenuItem 
                key={s.symbol}
                onClick={() => onChangeSymbol(s.symbol, s.name)}
                className={symbol === s.symbol ? "bg-primary/20" : ""}
              >
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 bg-secondary/50 rounded">
          {symbol.split(":")[1]}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Chart */}
      <div ref={containerRef} style={{ height: `${height}px` }} />
    </div>
  )
}

export function MultiChartView() {
  const [layout, setLayout] = useState(layouts[1]) // 2x2 default
  const [charts, setCharts] = useState<ChartConfig[]>(defaultCharts)

  const handleChangeSymbol = (index: number, symbol: string, name: string) => {
    const newCharts = [...charts]
    newCharts[index] = { ...newCharts[index], symbol, name }
    setCharts(newCharts)
  }

  // Adjust charts array when layout changes
  useEffect(() => {
    if (charts.length < layout.count) {
      const additionalCharts = availableSymbols
        .filter(s => !charts.find(c => c.symbol === s.symbol))
        .slice(0, layout.count - charts.length)
        .map(s => ({ symbol: s.symbol, name: s.name.split(" ")[0], interval: "60" }))
      setCharts([...charts, ...additionalCharts])
    }
  }, [layout, charts])

  const chartHeight = layout.rows === 1 ? 350 : layout.rows === 2 ? 280 : 220

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Multi-Chart View</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Compare multiple assets in real-time
          </p>
        </div>
        
        {/* Layout Selector */}
        <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1 border border-border/30">
          {layouts.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l)}
              className={`p-1.5 rounded-md transition-all ${
                layout.id === l.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
              title={`${l.cols}x${l.rows} layout`}
            >
              <l.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div 
        className="p-3 gap-3"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        }}
      >
        {charts.slice(0, layout.count).map((chart, index) => (
          <MiniChart
            key={`${chart.symbol}-${index}`}
            symbol={chart.symbol}
            name={chart.name}
            interval={chart.interval}
            height={chartHeight}
            onChangeSymbol={(symbol, name) => handleChangeSymbol(index, symbol, name)}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(MultiChartView)
