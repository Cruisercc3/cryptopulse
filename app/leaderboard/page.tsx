import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LeaderboardHeader } from "@/components/leaderboard/leaderboard-header"
import { LeaderboardStats } from "@/components/leaderboard/leaderboard-stats"
import { ResolvedPredictionsTable } from "@/components/leaderboard/resolved-predictions-table"
import { AccuracyByCategory } from "@/components/leaderboard/accuracy-by-category"

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          <LeaderboardHeader />
          
          <div className="space-y-10 mt-8">
            <LeaderboardStats />
            <ResolvedPredictionsTable />
            <AccuracyByCategory />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
