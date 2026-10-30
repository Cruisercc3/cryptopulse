import { TrendingUp, Users, Building2, Bot, LineChart, Shield } from "lucide-react"

// Each feature line is something the live site does today.
const useCases = [
  {
    icon: TrendingUp,
    title: "Active Traders",
    description: "Read prediction market odds next to spot price, RSI and MACD to time entries and exits.",
    features: ["Live odds on every crypto market", "24h, 7d and 30d probability moves", "Contrarian flags on big swings"],
  },
  {
    icon: Users,
    title: "Research Analysts",
    description: "Track what the market expects for crypto events and how that expectation has moved.",
    features: ["Probability history per market", "Fastest movers and highest volume", "Spot chart beside the odds"],
  },
  {
    icon: Building2,
    title: "Institutions",
    description: "See prediction market sentiment, spot data and the Fear & Greed Index in one place.",
    features: ["JSON routes behind every page", "Signal rule documented in the open", "RSI, MACD and Fear & Greed per card"],
  },
  {
    icon: Bot,
    title: "Algo Developers",
    description: "Build on the same JSON routes the pages use. Past signals aren't stored yet, so there's nothing to backtest against.",
    features: ["Slim market feed, 150 markets", "Yes-price history per market", "RSI and MACD per coin"],
  },
  {
    icon: LineChart,
    title: "Portfolio Managers",
    description: "Gauge market expectations for major catalysts before adjusting exposure.",
    features: ["Markets grouped by asset", "Resolves-within filter", "Volume and liquidity per market"],
  },
  {
    icon: Shield,
    title: "Risk Managers",
    description: "Watch tail risks through prediction markets and spot when unlikely outcomes gain probability.",
    features: ["Long shots jumping 5pp or more flagged", "Biggest 24h movers", "Short AI brief per market"],
  },
]

export function UseCases() {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Built for Every Crypto Participant
          </h2>
          <p className="text-lg text-muted-foreground">
            From individual traders to institutional research desks, TheCryptoPulse delivers actionable intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="group glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <useCase.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{useCase.description}</p>
              <ul className="space-y-2">
                {useCase.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
