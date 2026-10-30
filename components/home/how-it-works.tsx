import { Database, Brain, Zap, ArrowRight } from "lucide-react"

const steps = [
  {
    title: "Polymarket Data",
    description:
      "Live prediction market data from Polymarket's Gamma and CLOB APIs. Crypto markets filtered automatically. Probabilities, volumes, resolution dates, and historical price data.",
    icon: Database,
  },
  {
    title: "AI Interpretation",
    description:
      "gpt-oss-120b on Groq reads each market's odds, its 24h and 7d moves and its volume, then writes a two or three sentence brief. Specific trading context, not generic commentary.",
    icon: Brain,
  },
  {
    title: "Trading Signals",
    description:
      "One fixed rule turns each 24h move into bullish, bearish, contrarian or neutral. Spot price, RSI, MACD and Fear & Greed sit next to it for context.",
    icon: Zap,
  },
]

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            From Prediction to Signal
          </h2>
          <p className="text-lg text-muted-foreground">
            How TheCryptoPulse transforms prediction market data into trading intelligence
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="glass-card rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300">
                  {/* Step number */}
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
