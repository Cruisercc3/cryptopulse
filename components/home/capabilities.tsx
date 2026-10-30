import Link from "next/link"
import { Activity, Brain, BarChart3, TrendingUp, ArrowRight } from "lucide-react"

const capabilities = [
  {
    category: "PREDICTIONS",
    title: "Live Crypto Prediction Markets",
    description:
      "Browse active crypto prediction markets from Polymarket. Current probabilities, trading volume, liquidity depth, and time to resolution. Filtered to show only cryptocurrency and DeFi markets.",
    href: "/predictions",
    linkText: "Predictions Dashboard",
    icon: Activity,
  },
  {
    category: "INTELLIGENCE",
    title: "AI Signal Analysis",
    description:
      "A fixed rule labels every probability move, and an AI model writes a short brief on it. When a BTC market jumps from 45% to 72% on rising volume, the brief says what that means for spot and futures positioning.",
    href: "/signals",
    linkText: "Signal Analysis",
    icon: Brain,
  },
  {
    category: "CHARTING",
    title: "Probability Charts",
    description:
      "Each market's probability history from Polymarket, next to its coin's TradingView price chart. Track how market consensus evolves from 24 hours to all time.",
    href: "/charts",
    linkText: "Charts",
    icon: BarChart3,
  },
  {
    category: "DISCOVERY",
    title: "Trending & Leaderboard",
    description:
      "Highest volume predictions, fastest probability movers and markets approaching resolution, all live. The accuracy leaderboard is a simulated preview until past signals are stored.",
    href: "/trending",
    linkText: "Trending",
    icon: TrendingUp,
  },
]

export function Capabilities() {
  return (
    <section className="py-24 bg-card/20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-primary mb-3">PLATFORM</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Platform Capabilities
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to interpret prediction market data
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {capabilities.map((cap, index) => (
            <div
              key={index}
              className="group relative glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              {/* Left accent */}
              <div className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full bg-primary/50" />

              {/* Category */}
              <div className="flex items-center gap-3 mb-4 pl-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <cap.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium tracking-wider text-primary">
                  {cap.category}
                </span>
              </div>

              {/* Content */}
              <div className="pl-4">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {cap.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm mb-4">
                  {cap.description}
                </p>

                {/* Link */}
                <Link
                  href={cap.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group/link"
                >
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  {cap.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
