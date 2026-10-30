import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Layers,
  Database,
  Brain,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  Zap,
  Radio,
  Plug,
} from "lucide-react"

const architectureLayers = [
  {
    layer: "01",
    title: "Data Layer",
    description:
      "Live connections to Polymarket's Gamma API (markets, odds, volume, 24h/7d/30d moves) and CLOB API (price history), plus CoinGecko, CoinMarketCap and alternative.me. Crypto markets come from Polymarket's crypto tag, with a keyword scan as a fallback.",
    icon: Database,
    features: ["Live market data", "Price history", "Spot + technicals", "Automatic crypto filtering"],
  },
  {
    layer: "02",
    title: "Processing Layer",
    description:
      "One normaliser turns each market into the same shape (probability, 24h/7d/30d changes, volume, liquidity, asset), labels it with one rule and scores its confidence.",
    icon: Radio,
    features: ["Data normalization", "Change calculations", "One signal rule", "Cache management"],
  },
  {
    layer: "03",
    title: "Intelligence Layer",
    description:
      "gpt-oss-120b on Groq writes a short brief for each market a visitor looks at, from its odds, moves and volume. The signal label (confluence, divergence, contrarian, neutral) comes from the fixed rule, not the model.",
    icon: Brain,
    features: ["AI briefs", "Rule-based labels", "Confidence scoring", "Template fallback"],
  },
  {
    layer: "04",
    title: "Visualization Layer",
    description:
      "TradingView charts for coin prices and Recharts for each market's probability history. Sparklines, probability bars and signal indicators throughout the interface, all from real history.",
    icon: BarChart3,
    features: ["TradingView charts", "Interactive sparklines", "Real-time updates", "Multi-chart overlays"],
  },
  {
    layer: "05",
    title: "Application Layer",
    description:
      "Next.js 16 application with TypeScript, Tailwind CSS and shadcn/ui. Client components poll through SWR and share one request per source. Serverless API routes with CDN caching.",
    icon: Layers,
    features: ["App Router", "Serverless routes", "Type safety", "Component library"],
  },
  {
    layer: "06",
    title: "User Layer",
    description:
      "Not built yet. The sign-in page is a design preview. Saved signals work today but live in the visitor's browser. Accounts, synced watchlists and notifications are the next layer to build.",
    icon: Users,
    features: ["Sign-in design", "Saved signals (local)", "Watchlists (planned)", "Notifications (planned)"],
  },
]

const integrations = [
  {
    name: "Polymarket Gamma API",
    description: "Market metadata, questions, resolution dates",
    status: "active",
  },
  {
    name: "CoinGecko + CoinMarketCap",
    description: "Spot prices, candles for RSI and MACD, global metrics",
    status: "active",
  },
  {
    name: "Polymarket CLOB API",
    description: "Yes-price history for every market",
    status: "active",
  },
  {
    name: "Groq AI",
    description: "Short AI briefs from gpt-oss-120b",
    status: "active",
  },
  {
    name: "TradingView",
    description: "Coin price charts",
    status: "active",
  },
  {
    name: "Vercel",
    description: "Hosting, serverless functions, CDN cache",
    status: "active",
  },
]

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wider text-primary">
                ARCHITECTURE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Platform Architecture
            </h1>
            <p className="text-lg text-muted-foreground">
              Six integrated layers power TheCryptoPulse — from raw prediction market data 
              to actionable trading signals delivered to your dashboard.
            </p>
          </div>

          {/* Architecture Layers */}
          <div className="space-y-6 mb-20">
            {architectureLayers.map((layer, index) => (
              <div
                key={index}
                className="group glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Layer Number & Icon */}
                  <div className="flex items-center gap-4 lg:w-48 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <layer.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Layer</p>
                      <p className="text-2xl font-bold text-primary">{layer.layer}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {layer.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {layer.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {layer.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-medium bg-secondary/50 text-muted-foreground rounded-md border border-border/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  {index < architectureLayers.length - 1 && (
                    <div className="hidden lg:flex items-center">
                      <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Integrations */}
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wider text-primary">
                INTEGRATIONS
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              External Services
            </h2>
            <p className="text-muted-foreground">
              TheCryptoPulse connects to these services for data, AI, and deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="glass-card rounded-lg p-4 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-medium text-foreground">{integration.name}</h4>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === "active"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        integration.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {integration.status === "active" ? "Active" : "Configured"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tech Stack Summary */}
          <div className="mt-16 p-8 rounded-xl bg-card/30 border border-border/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Production Ready
              </span>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The complete architecture runs on Vercel's edge network with ~$1/month 
              infrastructure cost. All external APIs are free-tier or have generous 
              free quotas.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
