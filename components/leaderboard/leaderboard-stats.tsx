import { CheckCircle2, Target, DollarSign } from "lucide-react"

const stats = [
  {
    label: "Total Resolved",
    value: "847",
    subtext: "Predictions completed",
    icon: CheckCircle2,
    iconColor: "text-primary",
  },
  {
    label: "Market Accuracy",
    value: "73.2%",
    subtext: "Majority predicted correctly",
    icon: Target,
    iconColor: "text-emerald-500",
  },
  {
    label: "Average Volume",
    value: "$1.8M",
    subtext: "Per prediction",
    icon: DollarSign,
    iconColor: "text-amber-500",
  },
]

export function LeaderboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-secondary/50`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{stat.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
