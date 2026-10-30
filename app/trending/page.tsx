import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TrendingHeader } from "@/components/trending/trending-header"
import { FastestMovers } from "@/components/trending/fastest-movers"
import { HighestVolume } from "@/components/trending/highest-volume"
import { ApproachingResolution } from "@/components/trending/approaching-resolution"
import { TrendingTable } from "@/components/trending/trending-table"

export default function TrendingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <TrendingHeader />
          
          <div className="space-y-10 mt-8">
            <FastestMovers />
            <HighestVolume />
            <ApproachingResolution />
            <TrendingTable />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
