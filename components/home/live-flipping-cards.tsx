"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, Zap, Activity, Volume2 } from "lucide-react"
import { useMarkets, usePriceHistory } from "@/hooks/use-markets"
import { ProbabilityLine } from "@/components/probability-sparkline"
import { formatDate, formatProbability, formatUsd, type Market } from "@/lib/signals"

const signalConfig = {
  bullish: {
    bg: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/20",
    icon: TrendingUp,
  },
  bearish: {
    bg: "from-red-500/20 to-red-500/5",
    border: "border-red-500/40",
    text: "text-red-400",
    glow: "shadow-red-500/20",
    icon: TrendingDown,
  },
  neutral: {
    bg: "from-slate-500/20 to-slate-500/5",
    border: "border-slate-500/40",
    text: "text-slate-400",
    glow: "shadow-slate-500/20",
    icon: Activity,
  },
  contrarian: {
    bg: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/40",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    icon: Zap,
  },
}

function MiniSparkline({ market }: { market: Market }) {
  const history = usePriceHistory(market.yesTokenId, "1w")
  const color = market.signal === "bearish" ? "#ef4444" : market.signal === "contrarian" ? "#f59e0b" : "#10b981"
  return <ProbabilityLine points={history.points} isLoading={history.isLoading} color={color} className="w-full h-8" />
}

function FlippingCard({
  prediction,
  isActive,
  position,
}: {
  prediction: Market
  isActive: boolean
  position: "front" | "back" | "hidden"
}) {
  const config = signalConfig[prediction.signal]
  const SignalIcon = config.icon

  return (
    <div
      className={`absolute inset-0 w-full h-full backface-hidden transition-all duration-700 ease-out ${
        position === "front"
          ? "rotate-y-0 opacity-100 z-20"
          : position === "back"
            ? "rotate-y-180 opacity-0 z-10"
            : "rotate-y-180 opacity-0 z-0"
      }`}
      style={{
        transformStyle: "preserve-3d",
        transform: position === "front" ? "rotateY(0deg)" : "rotateY(180deg)",
      }}
    >
      <div
        className={`relative w-full h-full rounded-2xl border ${config.border} bg-gradient-to-br ${config.bg} backdrop-blur-xl overflow-hidden shadow-xl ${config.glow}`}
      >
        {/* Animated glow effect */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30 ${
            prediction.signal === "bullish"
              ? "bg-emerald-500"
              : prediction.signal === "bearish"
                ? "bg-red-500"
                : prediction.signal === "contrarian"
                  ? "bg-amber-500"
                  : "bg-slate-500"
          } ${isActive ? "animate-pulse" : ""}`}
        />

        {/* Card content */}
        <div className="relative p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-sm font-bold text-foreground">
                {prediction.asset === "Other" ? "MKT" : prediction.asset}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold uppercase ${config.text}`}>
                    {prediction.signal}
                  </span>
                  <SignalIcon className={`w-3 h-3 ${config.text}`} />
                </div>
                <span className="text-[10px] text-muted-foreground">Resolves {formatDate(prediction.endDate)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-background/50 border border-border/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">LIVE</span>
            </div>
          </div>

          {/* Question */}
          <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-2 flex-grow">
            {prediction.question}
          </h3>

          {/* Sparkline */}
          <div className="mb-3 rounded-lg bg-background/30 p-2">
            <MiniSparkline market={prediction} />
          </div>

          {/* Stats */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                Probability
              </p>
              <p className="text-3xl font-bold text-foreground">{formatProbability(prediction.probability)}</p>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-1 ${config.text}`}>
                {prediction.change24h >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span className="text-sm font-semibold">
                  {prediction.change24h > 0 ? "+" : ""}
                  {prediction.change24h.toFixed(1)}pp
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                <Volume2 className="w-3 h-3" />
                <span>{formatUsd(prediction.volume24h)} 24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LiveFlippingCards() {
  const { markets, isLoading } = useMarkets()
  // The six biggest 24h movers that traded today, three shown at a time
  const livePredictions = useMemo(
    () =>
      markets
        .filter((m) => m.volume24h > 0)
        .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h) || b.volume24h - a.volume24h)
        .slice(0, 6),
    [markets],
  )
  const count = livePredictions.length
  const [activeIndices, setActiveIndices] = useState([0, 1, 2])
  const [flipStates, setFlipStates] = useState<("front" | "back" | "hidden")[]>(["front", "front", "front"])

  const rotateCards = useCallback(() => {
    setFlipStates(["back", "back", "back"])

    setTimeout(() => {
      setActiveIndices((prev) => {
        const newIndices = prev.map((idx) => (idx + 3) % Math.max(count, 1))
        return newIndices
      })
      setFlipStates(["front", "front", "front"])
    }, 350)
  }, [count])

  useEffect(() => {
    if (count <= 3) return
    const interval = setInterval(rotateCards, 4000)
    return () => clearInterval(interval)
  }, [rotateCards])

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Live Predictions
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 text-balance">
            Real-Time Market Intelligence
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            The six crypto markets on Polymarket that moved most in the last 24 hours
          </p>
        </div>

        {/* Flipping Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {isLoading &&
            [0, 1, 2].map((i) => <div key={i} className="h-[280px] rounded-2xl bg-secondary/30 animate-pulse" />)}
          {!isLoading && count === 0 && (
            <div className="md:col-span-3 text-center text-sm text-muted-foreground py-10">
              Polymarket didn&apos;t answer. Nothing is shown in its place.
            </div>
          )}
          {count > 0 &&
            activeIndices
              .map((idx) => livePredictions[idx % count])
              .filter((p, i, arr) => p && arr.findIndex((x) => x?.id === p.id) === i)
              .map((prediction, cardIdx) => (
                <Link
                  key={cardIdx}
                  href={`/signals?id=${prediction.id}`}
                  className="relative h-[280px] block"
                  style={{ perspective: "1000px" }}
                >
                  <FlippingCard
                    prediction={prediction}
                    isActive={true}
                    position={flipStates[cardIdx]}
                  />
                </Link>
              ))}
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(count / 3) }).map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-1 rounded-full transition-all duration-300 ${
                Math.floor(activeIndices[0] / 3) === idx
                  ? "bg-primary"
                  : "bg-secondary/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
