"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChartsHeader } from "@/components/charts/charts-header"
import { TradingViewChart } from "@/components/charts/tradingview-chart"
import { MultiChartView } from "@/components/charts/multi-chart-view"
import { AiAnalysisPanel } from "@/components/charts/ai-analysis-panel"
import { RelatedPredictions } from "@/components/charts/related-predictions"
import { ProbabilityChart } from "@/components/charts/probability-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Grid2X2, Activity } from "lucide-react"
import { useMarkets } from "@/hooks/use-markets"
import { ASSET_TV_SYMBOL } from "@/lib/signals"

export default function ChartsPage() {
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { markets } = useMarkets()

  // /charts?id=<market id> comes from the Chart buttons elsewhere on the site
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id")
    if (id) setSelectedId(id)
  }, [])

  // Markets tied to a coin TradingView can chart, most traded first
  const chartable = useMemo(
    () => markets.filter((m) => ASSET_TV_SYMBOL[m.asset]).sort((a, b) => b.volume24h - a.volume24h),
    [markets],
  )

  // Default to the most traded coin market that's still in play (3% to 97%)
  const selected = useMemo(
    () =>
      markets.find((m) => m.id === selectedId) ??
      chartable.find((m) => m.probability >= 3 && m.probability <= 97) ??
      chartable[0] ??
      markets[0] ??
      null,
    [markets, chartable, selectedId],
  )

  // The selector lists the top 25 coin markets, plus the linked one if it isn't among them
  const selectorMarkets = useMemo(() => {
    const top = chartable.slice(0, 25)
    return selected && !top.some((m) => m.id === selected.id) ? [selected, ...top] : top
  }, [chartable, selected])

  const selectMarket = useCallback((id: string) => {
    setSelectedId(id)
    setShowAnalysis(false)
    const url = new URL(window.location.href)
    url.searchParams.set("id", id)
    window.history.replaceState(null, "", url.toString())
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <ChartsHeader market={selected} />

          <div className="mt-8">
            <Tabs defaultValue="single" className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <TabsList className="bg-secondary/30 border border-border/30">
                  <TabsTrigger value="single" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Single Chart
                  </TabsTrigger>
                  <TabsTrigger value="multi" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Grid2X2 className="w-4 h-4" />
                    Multi-Chart
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Live TradingView + Polymarket data</span>
                </div>
              </div>

              <TabsContent value="single" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Main Chart Area */}
                  <div className="lg:col-span-3 space-y-4 min-w-0">
                    <TradingViewChart
                      onAnalysisClick={() => setShowAnalysis(!showAnalysis)}
                      markets={selectorMarkets}
                      selected={selected}
                      onSelect={selectMarket}
                    />

                    <AiAnalysisPanel isOpen={showAnalysis} market={selected} />

                    <ProbabilityChart market={selected} />
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1 min-w-0">
                    <RelatedPredictions market={selected} markets={markets} onSelect={selectMarket} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="multi" className="mt-0">
                <MultiChartView />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
