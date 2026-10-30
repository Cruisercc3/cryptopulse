"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PredictionsHeader } from "@/components/predictions/predictions-header"
import { PredictionsFilters } from "@/components/predictions/predictions-filters"
import { LivePredictionsGrid } from "@/components/predictions/live-predictions-grid"
import { LiveMarketBanner } from "@/components/predictions/live-market-banner"

export default function PredictionsPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [sortBy, setSortBy] = useState("trending")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTimeframe, setActiveTimeframe] = useState("all")
  const [activeAsset, setActiveAsset] = useState("all")
  const [directionFilter, setDirectionFilter] = useState("all")

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <PredictionsHeader />
          <LiveMarketBanner />
          <PredictionsFilters
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTimeframe={activeTimeframe}
            setActiveTimeframe={setActiveTimeframe}
            activeAsset={activeAsset}
            setActiveAsset={setActiveAsset}
            directionFilter={directionFilter}
            setDirectionFilter={setDirectionFilter}
          />
          <LivePredictionsGrid
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            sortBy={sortBy}
            activeTimeframe={activeTimeframe}
            activeAsset={activeAsset}
            directionFilter={directionFilter}
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}
