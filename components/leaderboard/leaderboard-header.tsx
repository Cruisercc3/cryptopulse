"use client"

import { Trophy, Target, CheckCircle2, XCircle, BarChart3, Clock, Award, TrendingUp, Percent } from "lucide-react"

const accuracyStats = [
  { label: "Overall Accuracy", value: "73.2%", icon: Target, color: "text-primary", description: "Across all resolved markets" },
  { label: "Correct Predictions", value: "847", icon: CheckCircle2, color: "text-emerald-400", description: "Out of 1,156 total" },
  { label: "Resolution Rate", value: "89%", icon: Clock, color: "text-amber-400", description: "Markets resolved on time" },
  { label: "Top Category", value: "Bitcoin", icon: Award, color: "text-cyan-400", description: "82% accuracy rate" },
]

const topPerformers = [
  { category: "Bitcoin Price", accuracy: 82, resolved: 156, color: "bg-amber-500" },
  { category: "Ethereum Events", accuracy: 78, resolved: 124, color: "bg-cyan-500" },
  { category: "Regulation", accuracy: 76, resolved: 89, color: "bg-emerald-500" },
  { category: "DeFi Metrics", accuracy: 71, resolved: 98, color: "bg-primary" },
]

export function LeaderboardHeader() {
  return (
    <div className="mb-10">
      {/* Main Header */}
      <div className="relative">
        {/* 3D Background Effects */}
        <div className="absolute -top-20 -left-16 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl" />
        <div className="absolute top-10 right-0 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-48 h-48 bg-emerald-500/6 rounded-full blur-2xl" />

        <div className="relative">
          {/* Badge Row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/40 rounded-xl blur-lg" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-transparent border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Leaderboard
              </span>
              <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded-full">
                Historical Performance
              </span>
              <span className="flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full border border-amber-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Simulated
              </span>
            </div>
          </div>

          {/* Plain notice: nothing on this page is measured yet */}
          <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200/90">
            <span className="font-semibold text-amber-400">Simulated data.</span>{" "}
            CryptoPulse doesn&apos;t store past signals yet, so there&apos;s no real track record to score.
            Every number on this page is a placeholder showing how the leaderboard would look.
            The live pages are Signals, Predictions, Trending and Charts.
          </div>

          {/* Title & Content Grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Title & Description */}
            <div className="lg:col-span-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                Prediction Accuracy
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Track the historical accuracy of prediction markets across all categories. 
                This leaderboard shows which market types have the <span className="text-primary font-medium">highest accuracy rates</span>, 
                helping you identify where collective intelligence is most reliable and where 
                contrarian opportunities may exist.
              </p>

              {/* Accuracy Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {accuracyStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="group relative"
                  >
                    {/* 3D Shadow */}
                    <div className="absolute inset-0 bg-secondary/40 rounded-xl translate-y-1 translate-x-0.5 opacity-40" />
                    
                    <div className="relative glass-card rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs font-medium text-foreground/80">{stat.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stat.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* How Accuracy is Calculated */}
              <div className="glass-card rounded-xl p-4 border border-border/40">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">How Accuracy is Calculated</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Percent className="w-3 h-3 text-primary" />
                      <span className="font-medium text-foreground">Brier Score</span>
                    </div>
                    <p>Measures calibration between predicted probabilities and actual outcomes</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3 h-3 text-emerald-400" />
                      <span className="font-medium text-foreground">Hit Rate</span>
                    </div>
                    <p>Percentage of markets where probability direction was correct</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      <span className="font-medium text-foreground">Edge</span>
                    </div>
                    <p>Expected value vs. random chance, weighted by volume</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Top Performers */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-5 border border-border/40 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Top Performing Categories
                  </h3>
                  <span className="text-[10px] text-muted-foreground">By accuracy rate</span>
                </div>

                <div className="space-y-4">
                  {topPerformers.map((performer, idx) => (
                    <div key={performer.category} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-secondary/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">{performer.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{performer.resolved} resolved</span>
                          <span className="text-sm font-bold text-foreground">{performer.accuracy}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${performer.color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                          style={{ width: `${performer.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Above 75% = High Confidence</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>Below 60% = Contrarian Zone</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
