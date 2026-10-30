import { Database, Brain, Zap, ArrowRight, Globe, Activity, BarChart3, MessageSquare } from "lucide-react"

const dataPipeline = [
  {
    stage: "Ingest",
    title: "Multi-Source Data Collection",
    description: "Live feeds from Polymarket, coin price APIs and a sentiment index",
    icon: Database,
    sources: [
      { name: "Polymarket", type: "Prediction Markets" },
      { name: "CoinGecko", type: "Prices + Candles" },
      { name: "CoinMarketCap", type: "Quotes + Global" },
      { name: "alternative.me", type: "Fear & Greed" },
    ],
  },
  {
    stage: "Process",
    title: "Rule Signals + AI Briefs",
    description: "A fixed rule labels each market. gpt-oss-120b on Groq writes the brief",
    icon: Brain,
    metrics: [
      { label: "RSI Analysis", value: "14-period" },
      { label: "MACD Signals", value: "12/26/9" },
      { label: "Signal Rule", value: "24h move" },
      { label: "Fear & Greed", value: "0-100" },
    ],
  },
  {
    stage: "Deliver",
    title: "Signal Distribution",
    description: "Filtered, ranked signals on the web, plus the JSON routes behind them",
    icon: Zap,
    channels: [
      { name: "Web Dashboard", status: "Live" },
      { name: "JSON API Routes", status: "Live" },
      { name: "Webhooks", status: "Not built" },
      { name: "Mobile Push", status: "Not built" },
    ],
  },
]

const integrationLogos = [
  { name: "Polymarket", category: "Predictions" },
  { name: "CoinGecko", category: "Prices" },
  { name: "CoinMarketCap", category: "Prices" },
  { name: "alternative.me", category: "Sentiment" },
  { name: "TradingView", category: "Charts" },
  { name: "Groq", category: "AI" },
]

export function DataSources() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
            Comprehensive Data Pipeline
          </h2>
          <p className="text-lg text-muted-foreground">
            Every signal card puts prediction market odds next to spot prices, technicals and sentiment, each from its own live source.
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="relative mb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {dataPipeline.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="glass-card rounded-2xl p-6 h-full">
                  {/* Stage Badge */}
                  <div className="absolute -top-3 left-6">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {stage.stage}
                    </span>
                  </div>

                  <div className="pt-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                      <stage.icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-2">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{stage.description}</p>

                    {/* Stage-specific content */}
                    {stage.sources && (
                      <div className="space-y-2">
                        {stage.sources.map((source) => (
                          <div key={source.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                            <span className="text-sm font-medium text-foreground">{source.name}</span>
                            <span className="text-xs text-muted-foreground">{source.type}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {stage.metrics && (
                      <div className="grid grid-cols-2 gap-2">
                        {stage.metrics.map((metric) => (
                          <div key={metric.label} className="p-2 rounded-lg bg-secondary/30 text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">{metric.label}</p>
                            <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {stage.channels && (
                      <div className="space-y-2">
                        {stage.channels.map((channel) => (
                          <div key={channel.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                            <span className="text-sm font-medium text-foreground">{channel.name}</span>
                            <span className={`text-xs font-medium ${channel.status === "Live" ? "text-emerald-500" : "text-muted-foreground"}`}>
                              {channel.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow connector */}
                {index < dataPipeline.length - 1 && (
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

        {/* Integration Logos */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">Where the data comes from</p>
          <div className="flex flex-wrap justify-center gap-4">
            {integrationLogos.map((logo) => (
              <div key={logo.name} className="px-6 py-3 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors">
                <p className="text-sm font-medium text-foreground">{logo.name}</p>
                <p className="text-xs text-muted-foreground">{logo.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
