import { Layers, Radio, Brain, Plug, Activity, DollarSign } from "lucide-react"

const metrics = [
  {
    value: "6",
    label: "Architecture Layers",
    description: "Integrated intelligence system",
    icon: Layers,
  },
  {
    value: "Live",
    label: "Polymarket Data",
    description: "Real-time prediction markets",
    icon: Radio,
  },
  {
    value: "AI",
    label: "Signal Briefs",
    description: "gpt-oss-120b on Groq",
    icon: Brain,
  },
  {
    value: "4",
    label: "Data Sources",
    description: "Polymarket, CoinGecko, CMC, alternative.me",
    icon: Plug,
  },
  {
    value: "150",
    label: "Crypto Markets",
    description: "Top by volume, refreshed every 30s",
    icon: Activity,
  },
  {
    value: "~$1/mo",
    label: "Infrastructure",
    description: "Free-tier deployment",
    icon: DollarSign,
  },
]

export function MetricsBar() {
  return (
    <section className="py-16 border-y border-border/30 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="group relative p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-primary/30 transition-all duration-300"
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <metric.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-foreground leading-none mb-1">
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-foreground/80 mb-0.5">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {metric.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
