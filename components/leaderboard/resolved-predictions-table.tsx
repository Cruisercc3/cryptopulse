"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResolvedPrediction {
  id: string
  question: string
  finalProbability: number
  outcome: "correct" | "incorrect"
  volume: string
  resolutionDate: string
  marketAccuracy: number
}

const resolvedPredictions: ResolvedPrediction[] = [
  { id: "1", question: "Will BTC exceed $80,000 by January 2026?", finalProbability: 72, outcome: "correct", volume: "$4.2M", resolutionDate: "Jan 15, 2026", marketAccuracy: 78 },
  { id: "2", question: "Will ETH 2.0 staking reach 30M by Q4 2025?", finalProbability: 81, outcome: "correct", volume: "$2.8M", resolutionDate: "Dec 31, 2025", marketAccuracy: 85 },
  { id: "3", question: "Will the SEC approve spot ETH ETF in 2024?", finalProbability: 68, outcome: "correct", volume: "$6.1M", resolutionDate: "May 23, 2024", marketAccuracy: 72 },
  { id: "4", question: "Will Solana reach $300 by end of 2025?", finalProbability: 45, outcome: "incorrect", volume: "$3.4M", resolutionDate: "Dec 31, 2025", marketAccuracy: 52 },
  { id: "5", question: "Will BTC dominance stay above 45% through 2025?", finalProbability: 76, outcome: "correct", volume: "$2.1M", resolutionDate: "Dec 31, 2025", marketAccuracy: 81 },
  { id: "6", question: "Will Tether remain fully backed through 2025?", finalProbability: 88, outcome: "correct", volume: "$1.9M", resolutionDate: "Dec 31, 2025", marketAccuracy: 91 },
  { id: "7", question: "Will any L2 exceed Ethereum mainnet TVL in 2025?", finalProbability: 32, outcome: "correct", volume: "$1.4M", resolutionDate: "Dec 31, 2025", marketAccuracy: 38 },
  { id: "8", question: "Will BTC ETF inflows exceed $20B in 2024?", finalProbability: 58, outcome: "correct", volume: "$5.2M", resolutionDate: "Dec 31, 2024", marketAccuracy: 64 },
  { id: "9", question: "Will Cardano ship Voltaire governance?", finalProbability: 71, outcome: "correct", volume: "$890K", resolutionDate: "Sep 1, 2025", marketAccuracy: 76 },
  { id: "10", question: "Will any country ban Bitcoin mining in 2025?", finalProbability: 41, outcome: "incorrect", volume: "$1.2M", resolutionDate: "Dec 31, 2025", marketAccuracy: 47 },
  { id: "11", question: "Will Fed cut rates by March 2024?", finalProbability: 28, outcome: "incorrect", volume: "$3.8M", resolutionDate: "Mar 31, 2024", marketAccuracy: 34 },
  { id: "12", question: "Will BTC halving occur before May 2024?", finalProbability: 94, outcome: "correct", volume: "$2.3M", resolutionDate: "Apr 20, 2024", marketAccuracy: 97 },
  { id: "13", question: "Will Ethereum gas stay below 50 gwei avg in 2025?", finalProbability: 62, outcome: "correct", volume: "$980K", resolutionDate: "Dec 31, 2025", marketAccuracy: 68 },
  { id: "14", question: "Will DOGE be accepted by major retailer in 2025?", finalProbability: 23, outcome: "incorrect", volume: "$1.5M", resolutionDate: "Dec 31, 2025", marketAccuracy: 28 },
  { id: "15", question: "Will Binance US resume operations fully?", finalProbability: 38, outcome: "incorrect", volume: "$2.7M", resolutionDate: "Dec 31, 2025", marketAccuracy: 43 },
  { id: "16", question: "Will stablecoin total market cap exceed $200B?", finalProbability: 67, outcome: "correct", volume: "$1.8M", resolutionDate: "Nov 15, 2025", marketAccuracy: 72 },
  { id: "17", question: "Will MicroStrategy hold 200K+ BTC by 2025?", finalProbability: 74, outcome: "correct", volume: "$3.1M", resolutionDate: "Dec 31, 2025", marketAccuracy: 79 },
  { id: "18", question: "Will NFT trading volume recover to 2021 levels?", finalProbability: 18, outcome: "correct", volume: "$890K", resolutionDate: "Dec 31, 2025", marketAccuracy: 22 },
  { id: "19", question: "Will SEC sue another major exchange in 2025?", finalProbability: 54, outcome: "incorrect", volume: "$2.2M", resolutionDate: "Dec 31, 2025", marketAccuracy: 59 },
  { id: "20", question: "Will BTC close 2024 above $90,000?", finalProbability: 61, outcome: "correct", volume: "$7.4M", resolutionDate: "Dec 31, 2024", marketAccuracy: 67 },
]

type SortKey = "resolutionDate" | "volume" | "marketAccuracy"

export function ResolvedPredictionsTable() {
  const [sortBy, setSortBy] = useState<SortKey>("resolutionDate")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(sortDir === "desc" ? "asc" : "desc")
    } else {
      setSortBy(key)
      setSortDir("desc")
    }
  }

  const sorted = [...resolvedPredictions].sort((a, b) => {
    let aVal: number, bVal: number
    
    if (sortBy === "volume") {
      aVal = parseFloat(a.volume.replace(/[$,KMB]/g, ""))
      bVal = parseFloat(b.volume.replace(/[$,KMB]/g, ""))
      if (a.volume.includes("M")) aVal *= 1000
      if (b.volume.includes("M")) bVal *= 1000
    } else if (sortBy === "resolutionDate") {
      aVal = new Date(a.resolutionDate).getTime()
      bVal = new Date(b.resolutionDate).getTime()
    } else {
      aVal = a[sortBy]
      bVal = b[sortBy]
    }
    
    return sortDir === "desc" ? bVal - aVal : aVal - bVal
  })

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-foreground">Resolved Predictions <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Simulated</span></h2>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Sort by:</span>
          <Button
            variant={sortBy === "resolutionDate" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleSort("resolutionDate")}
            className="h-7 text-xs"
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === "volume" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleSort("volume")}
            className="h-7 text-xs"
          >
            Highest Volume
          </Button>
          <Button
            variant={sortBy === "marketAccuracy" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleSort("marketAccuracy")}
            className="h-7 text-xs"
          >
            Accuracy
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Prediction
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Final Prob.
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">
                  Outcome
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button 
                    onClick={() => handleSort("volume")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    Volume
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button 
                    onClick={() => handleSort("resolutionDate")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    Resolution Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  <button 
                    onClick={() => handleSort("marketAccuracy")}
                    className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                  >
                    Accuracy
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground line-clamp-1 max-w-sm">
                      {item.question}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-medium text-foreground">{item.finalProbability}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      {item.outcome === "correct" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          <CheckCircle2 className="w-3 h-3" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">
                          <XCircle className="w-3 h-3" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-foreground">{item.volume}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-muted-foreground">{item.resolutionDate}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${item.marketAccuracy >= 70 ? "text-emerald-500" : item.marketAccuracy >= 50 ? "text-amber-500" : "text-red-500"}`}>
                      {item.marketAccuracy}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
