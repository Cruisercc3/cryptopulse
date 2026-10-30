import { Bitcoin, Layers, Scale, TrendingUp, Coins, BarChart3 } from "lucide-react"

const categories = [
  {
    name: "Bitcoin",
    accuracy: 78,
    icon: Bitcoin,
    resolved: 142,
  },
  {
    name: "Ethereum",
    accuracy: 71,
    icon: Layers,
    resolved: 98,
  },
  {
    name: "DeFi",
    accuracy: 69,
    icon: Coins,
    resolved: 156,
  },
  {
    name: "Regulation",
    accuracy: 74,
    icon: Scale,
    resolved: 87,
  },
  {
    name: "Market Cap",
    accuracy: 72,
    icon: BarChart3,
    resolved: 124,
  },
  {
    name: "Altcoins",
    accuracy: 65,
    icon: TrendingUp,
    resolved: 240,
  },
]

export function AccuracyByCategory() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-foreground mb-4">Accuracy by Category <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Simulated</span></h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          const accuracyColor = cat.accuracy >= 75 
            ? "text-emerald-500" 
            : cat.accuracy >= 70 
              ? "text-primary" 
              : "text-amber-500"
          
          return (
            <div key={cat.name} className="glass-card rounded-xl p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{cat.name}</p>
              <p className={`text-2xl font-bold ${accuracyColor}`}>{cat.accuracy}%</p>
              <p className="text-xs text-muted-foreground mt-1">{cat.resolved} resolved</p>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-secondary/20 rounded-lg border border-border/30">
        <p className="text-sm text-muted-foreground">
          Accuracy measures how often the market consensus (probability above or below 50%) correctly predicted 
          the outcome. Higher accuracy indicates the prediction market was effective at aggregating information 
          for that category.
        </p>
      </div>
    </section>
  )
}
