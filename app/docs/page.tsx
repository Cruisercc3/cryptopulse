"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Database,
  Brain,
  BarChart3,
  Layers,
  Shield,
  Zap,
  Radio,
  Plug,
  ChevronRight,
  Code2,
  GitBranch,
  Terminal,
  BookOpen,
  ArrowRight,
  Clock,
  Activity,
  Server,
  Lock,
  Globe,
  FlaskConical,
  Package,
  Settings2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sections = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "data-layer", label: "Data Layer", icon: Database },
  { id: "processing", label: "Processing Pipeline", icon: Radio },
  { id: "intelligence", label: "Intelligence Engine", icon: Brain },
  { id: "api-reference", label: "API Reference", icon: Code2 },
  { id: "signals", label: "Signal Types", icon: Zap },
  { id: "auth", label: "Authentication", icon: Lock },
  { id: "deployment", label: "Deployment", icon: Server },
  { id: "integrations", label: "Integrations", icon: Plug },
]

const apiEndpoints = [
  {
    method: "GET",
    path: "/api/polymarket/markets",
    description: "Returns the active crypto markets from Polymarket's top 30 crypto events by volume (tag_slug=crypto), flattened and sorted by total volume. Each market is slimmed to the fields the UI needs. Falls back to a keyword scan of the top 200 markets if the events call returns fewer than 5. Cached at the CDN for 20 seconds.",
    params: [
      { name: "limit", type: "number", default: "100", description: "Maximum number of markets to return (capped at 150). The site asks for 150." },
    ],
    response: `[
  {
    "id": "string",
    "question": "string",
    "eventSlug": "string",
    "outcomePrices": "string",      // JSON-encoded array, Yes first
    "clobTokenIds": "string",       // JSON-encoded array, Yes first
    "volumeNum": number,
    "volume24hr": number,
    "volume1wk": number,
    "volume1mo": number,
    "liquidityNum": number,
    "oneDayPriceChange": number,    // 0.01 = 1 percentage point
    "oneWeekPriceChange": number,
    "oneMonthPriceChange": number,
    "endDate": "ISO 8601"
  }
]`,
  },
  {
    method: "GET",
    path: "/api/polymarket/history",
    description: "Yes-price history for one market from Polymarket's public CLOB API. Feeds every sparkline and the probability chart. Cached for 5 minutes per token and range.",
    params: [
      { name: "token", type: "string", required: true, description: "CLOB token id of the Yes outcome (from clobTokenIds)." },
      { name: "range", type: "string", default: "1d", description: "1d (hourly), 1w (6-hourly), 1m (daily) or max (daily)." },
    ],
    response: `{
  "points": [
    { "t": number,   // unix seconds
      "p": number }  // Yes price as a percentage
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/signals/analysis",
    description: "Writes a 2 to 3 sentence brief on one market with openai/gpt-oss-120b on Groq (Vercel AI SDK generateText, low reasoning effort). The signal label is not chosen here. It comes from a fixed rule and is passed in as context. Briefs are cached for 30 minutes per market and rounded state. On any failure it answers 502 and the card shows a plain template instead, marked Template.",
    params: [
      { name: "id", type: "string", required: false, description: "Polymarket market id, used as the cache key." },
      { name: "question", type: "string", required: true, description: "The market question text." },
      { name: "probability", type: "number", required: true, description: "Current Yes probability, 0 to 100." },
      { name: "change24h", type: "number", required: false, description: "24h change in percentage points." },
      { name: "change7d", type: "number", required: false, description: "7d change in percentage points." },
      { name: "volume24h", type: "number", required: false, description: "24h volume in USD." },
      { name: "signalType", type: "string", required: false, description: "bullish, bearish, contrarian or neutral, from the rule." },
    ],
    response: `{
  "analysis": "string",
  "source": "model",
  "model": "openai/gpt-oss-120b"
}`,
  },
  {
    method: "GET",
    path: "/api/coinmarketcap",
    description: "Top cryptocurrencies by market cap from CoinMarketCap's listings endpoint. Also /api/coinmarketcap/quotes?symbols=BTC,ETH and /api/coinmarketcap/global. Reads the CMC_API_KEY environment variable.",
    params: [
      { name: "limit", type: "number", default: "100", description: "Number of coins to return." },
    ],
    response: `{
  "data": [
    {
      "id": number,
      "name": "string",
      "symbol": "string",
      "price": number,
      "percentChange24h": number,
      "percentChange7d": number,
      "marketCap": number,
      "volume24h": number
    }
  ],
  "timestamp": "ISO 8601"
}`,
  },
  {
    method: "GET",
    path: "/api/market-data/[coin]",
    description: "Spot price, 24h/7d/30d change, market cap and volume from CoinGecko's markets endpoint, plus RSI (14-period, Wilder smoothing) and MACD (12/26/9) computed from 30 days of CoinGecko OHLC candles. No key needed. Each field is null if its source fails.",
    params: [
      { name: "coin", type: "string (path)", required: true, description: "CoinGecko coin id: bitcoin, ethereum, solana, ripple, binancecoin, dogecoin and a few more." },
    ],
    response: `{
  "currentPrice": number | null,
  "priceChange24h": number | null,
  "priceChange7d": number | null,
  "priceChange30d": number | null,
  "marketCap": number | null,
  "volume24h": number | null,
  "rsi": number | null,
  "rsiLabel": "Overbought" | "Neutral" | "Oversold" | null,
  "macd": "bullish" | "bearish" | null,
  "macdValue": number | null,
  "source": "coingecko"
}`,
  },
  {
    method: "GET",
    path: "/api/fear-greed",
    description: "The Crypto Fear & Greed Index from alternative.me: today, yesterday and the last 30 days.",
    params: [],
    response: `{
  "current":   { "value": number, "classification": "string", "timestamp": number },
  "yesterday": { "value": number, "classification": "string", "timestamp": number } | null,
  "history":   [ { "value": number, "classification": "string", "timestamp": number } ]
}`,
  },
]

const signalTypes = [
  {
    type: "Bullish",
    color: "emerald",
    description: "The market's Yes price rose by 2 percentage points or more in the last 24 hours.",
    criteria: [
      "24h change of +2pp or more",
      "Not a contrarian case (see below)",
    ],
  },
  {
    type: "Bearish",
    color: "red",
    description: "The market's Yes price fell by 2 percentage points or more in the last 24 hours.",
    criteria: [
      "24h change of -2pp or less",
      "Not a contrarian case (see below)",
    ],
  },
  {
    type: "Contrarian",
    color: "amber",
    description: "A big move against the crowd's consensus. Checked first, before bullish and bearish.",
    criteria: [
      "A long shot (Yes at 35% or less 24h ago) jumps 5pp or more",
      "Or a favourite (Yes at 65% or more 24h ago) drops 5pp or more",
    ],
  },
  {
    type: "Neutral",
    color: "slate",
    description: "The market moved less than 2 percentage points in 24 hours, so there's no clear direction.",
    criteria: [
      "24h change between -2pp and +2pp",
    ],
  },
]

const techStack = [
  { category: "Framework", items: ["Next.js 16 (App Router)", "React 19", "TypeScript 5"] },
  { category: "Styling", items: ["Tailwind CSS v4", "shadcn/ui", "tw-animate-css"] },
  { category: "Data Fetching", items: ["SWR", "Next.js fetch cache", "Vercel CDN cache headers"] },
  { category: "AI", items: ["openai/gpt-oss-120b on Groq", "Vercel AI SDK v6"] },
  { category: "Market Data", items: ["Polymarket Gamma API", "Polymarket CLOB API", "CoinMarketCap API", "CoinGecko API"] },
  { category: "Charting", items: ["TradingView embed widgets", "Recharts"] },
  { category: "Deployment", items: ["Vercel", "Vercel Analytics"] },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-10 relative">

            {/* Sidebar — sticky nav */}
            <aside className="hidden xl:block w-56 shrink-0">
              <div className="sticky top-28 space-y-1">
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-3 px-3">
                  Documentation
                </p>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSection(s.id)
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 ${
                      activeSection === s.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    {s.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-20">

              {/* Page Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold tracking-widest text-primary uppercase">Documentation</span>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4 font-heading">
                  TheCryptoPulse Docs
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Technical reference for TheCryptoPulse: how it's put together, where the data comes from,
                  how signals are labelled, what the AI does, every API route and how to deploy it.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <Link href="/signals">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-4 shadow-lg shadow-primary/20">
                      Open Signals
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                  <a href="https://github.com/Cruisercc3/cryptopulse" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs h-8 px-4 border-border/50">
                      <GitBranch className="w-3.5 h-3.5 mr-1.5" />
                      View on GitHub
                    </Button>
                  </a>
                </div>
              </div>

              {/* Overview */}
              <section id="overview" className="scroll-mt-28">
                <SectionHeader icon={BookOpen} label="OVERVIEW" title="What is TheCryptoPulse?" />
                <div className="prose-custom space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    TheCryptoPulse turns live probability data from Polymarket into labelled trading signals
                    for crypto markets. Instead of watching a hundred markets by hand, you get the top 150
                    crypto markets by volume, refreshed every 30 seconds, each with a signal label, a
                    confidence score and its price history.
                  </p>
                  <p>
                    The platform bridges two distinct information sources: the decentralized prediction markets 
                    on Polymarket, where people bet real money on future events, and spot market data
                    from CoinMarketCap and CoinGecko. By synthesizing 
                    prediction probabilities with technical indicators (RSI, MACD) and market sentiment 
                    (Fear & Greed Index), TheCryptoPulse delivers a richer analytical context than either 
                    source provides alone.
                  </p>
                  <p>
                    The label is set by one fixed rule on the 24h probability move: Bullish, Bearish,
                    Contrarian or Neutral. The confidence score comes from the size of the move and the
                    24h volume. On top of that, openai/gpt-oss-120b on Groq writes a short brief per card.
                    The model never picks the label.
                  </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-8">
                  {[
                    { icon: Activity, label: "Live Markets", value: "150", sub: "top crypto markets by volume" },
                    { icon: Clock, label: "Refresh Rate", value: "30s", sub: "signal feed polling interval" },
                    { icon: Brain, label: "AI Model", value: "gpt-oss-120b", sub: "via Groq inference" },
                  ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-xl p-5">
                      <stat.icon className="w-5 h-5 text-primary mb-3" />
                      <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Architecture */}
              <section id="architecture" className="scroll-mt-28">
                <SectionHeader icon={Layers} label="ARCHITECTURE" title="System Architecture" />
                <p className="text-muted-foreground leading-relaxed mb-8">
                  The platform is organized into six layers. Five are built. The sixth, the user layer,
                  is a design only. Everything runs as one Next.js app on Vercel with serverless API routes.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      num: "01", icon: Database, title: "Data Layer",
                      desc: "Server routes call Polymarket's Gamma API (markets, odds, volume, 24h/7d/30d moves) and CLOB API (price history), CoinGecko (spot price and daily candles), CoinMarketCap (quotes and global metrics) and alternative.me (Fear & Greed). Crypto markets come from Polymarket's tag_slug=crypto events, with a keyword scan as a fallback.",
                    },
                    {
                      num: "02", icon: Radio, title: "Processing Pipeline",
                      desc: "Each market is normalised once (lib/signals.ts): Yes probability, 24h/7d/30d changes in percentage points, volume, liquidity, resolution date, asset and category. Upstream calls carry revalidate hints of 30 seconds to 5 minutes, and the routes set CDN cache headers. The Polymarket events call skips the fetch cache because its raw reply is over Next's 2MB limit.",
                    },
                    {
                      num: "03", icon: Brain, title: "Intelligence Layer",
                      desc: "Two parts. A fixed rule labels every market from its 24h move and scores confidence from move size and volume. Then, for each card a visitor scrolls to, a short prompt with the market's numbers goes to openai/gpt-oss-120b on Groq, which writes a 2 to 3 sentence brief in plain text. Briefs are cached for 30 minutes.",
                    },
                    {
                      num: "04", icon: BarChart3, title: "Visualization Layer",
                      desc: "TradingView embed widgets draw the coin's spot price. Recharts draws each market's probability history from the CLOB, and small SVG sparklines on the cards use the same history. The Fear & Greed gauge is a custom SVG arc.",
                    },
                    {
                      num: "05", icon: Layers, title: "Application Layer",
                      desc: "Next.js 16 with the App Router. The data pages are client components that poll through SWR, so every component on a page shares one request per source. Filters, sort order, per-card timeframes and saved signals (kept in the browser's localStorage) all live on the client.",
                    },
                    {
                      num: "06", icon: Shield, title: "User Layer",
                      desc: "Not built. The sign-in page is a design preview and says so. The plan is OAuth with GitHub and Google plus email sign-in, then synced watchlists and alert thresholds. Today, saved signals live in the visitor's browser only.",
                    },
                  ].map((layer, i, arr) => (
                    <div key={layer.num} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
                      <div className="flex gap-5">
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                            <layer.icon className="w-5 h-5 text-primary" />
                          </div>
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-border/40 min-h-4" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-xs font-bold text-primary/50 font-mono">Layer {layer.num}</span>
                            <h3 className="text-base font-semibold text-foreground">{layer.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{layer.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Data Layer */}
              <section id="data-layer" className="scroll-mt-28">
                <SectionHeader icon={Database} label="DATA LAYER" title="Data Sources & Ingestion" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  TheCryptoPulse pulls from five external sources, each with its own job. All requests
                  go through Next.js API routes on the server, so keys never reach the browser.
                </p>
                <div className="space-y-3">
                  {[
                    {
                      name: "Polymarket Gamma API", url: "https://gamma-api.polymarket.com",
                      role: "Primary market data source. Provides event metadata, market questions, resolution criteria, outcomes, and current YES/NO probabilities. Markets are fetched with tag_slug=crypto and sorted by volume descending to surface the most actively traded markets.",
                      fields: ["question", "slug", "outcomePrices", "volumeNum", "liquidity", "endDate", "active"],
                    },
                    {
                      name: "Polymarket CLOB API", url: "https://clob.polymarket.com",
                      role: "Price history for each market's Yes token. Used for every sparkline and the probability chart, at hourly, 6-hourly or daily resolution. No key needed.",
                      fields: ["prices-history", "t", "p"],
                    },
                    {
                      name: "CoinMarketCap Pro API v1", url: "https://pro-api.coinmarketcap.com",
                      role: "Spot quotes for the market overview cards and the top 10 list, plus global market metrics. Reads the CMC_API_KEY environment variable.",
                      fields: ["price", "percent_change_24h", "percent_change_7d", "market_cap", "volume_24h"],
                    },
                    {
                      name: "CoinGecko Free API", url: "https://api.coingecko.com",
                      role: "Spot price, 24h/7d/30d change, market cap and volume for each card's coin, plus 30 days of OHLC candles for RSI (14-period Wilder smoothing) and MACD (12/26/9). No API key needed on the free tier, though rate limits apply.",
                      fields: ["current_price", "price_change_percentage_24h", "total_volume", "ohlc"],
                    },
                    {
                      name: "Alternative.me Fear & Greed", url: "https://api.alternative.me/fng",
                      role: "Composite market sentiment index combining volatility, market momentum, social media volume, Bitcoin dominance, and survey data. Shown on every signal card and as a gauge with 30 days of history.",
                      fields: ["value", "value_classification", "timestamp"],
                    },
                  ].map((src) => (
                    <div key={src.name} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all duration-200">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{src.name}</h4>
                          <code className="text-[11px] text-primary/70 font-mono">{src.url}</code>
                        </div>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{src.role}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {src.fields.map((f) => (
                          <code key={f} className="text-[10px] px-2 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/30 font-mono">
                            {f}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Processing */}
              <section id="processing" className="scroll-mt-28">
                <SectionHeader icon={Radio} label="PROCESSING" title="Processing Pipeline" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Raw API responses are transformed through a series of pure functions before reaching 
                  the UI. The pipeline is synchronous within each API route and designed to fail gracefully — 
                  a missing data source returns <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">null</code> for that field 
                  rather than throwing, ensuring partial data is still surfaced to the user.
                </p>
                <div className="space-y-5">
                  <SubSection title="Technical Indicator Computation">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      RSI and MACD are computed server-side from CoinGecko OHLC candles using the 
                      following algorithms:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <CodeBlock title="RSI — Wilder Smoothing (14-period)" code={`function computeRSI(closes: number[], period = 14): number {
  const changes = closes.slice(1).map((c, i) => c - closes[i])
  let avgGain = changes.slice(0, period)
    .filter(x => x > 0).reduce((a, b) => a + b, 0) / period
  let avgLoss = changes.slice(0, period)
    .filter(x => x < 0).map(Math.abs)
    .reduce((a, b) => a + b, 0) / period

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }
  const rs = avgGain / avgLoss
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10
}`} />
                      <CodeBlock title="MACD — 12/26/9 EMA" code={`function ema(data: number[], period: number): number[] {
  const k = 2 / (period + 1)
  return data.reduce((acc, val, i) => {
    acc.push(i === 0 ? val : val * k + acc[i - 1] * (1 - k))
    return acc
  }, [] as number[])
}

function computeMACD(closes: number[]) {
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i])
  const signal = ema(macdLine.slice(26), 9)
  const hist = macdLine.slice(26).map(
    (v, i) => v - signal[i]
  )
  return {
    value: hist[hist.length - 1],
    direction: hist[hist.length - 1] > 0 ? "bullish" : "bearish"
  }
}`} />
                    </div>
                  </SubSection>
                  <SubSection title="Market Filtering">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Polymarket returns events across all categories. The pipeline applies two filters:
                      primary filter uses <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">tag_slug=crypto</code> at the 
                      API level, and a secondary keyword scan over <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">question</code> and 
                      <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded"> description</code> fields covers markets that are categorized 
                      differently but are thematically crypto-adjacent (e.g. ETF approvals, CFTC rulings).
                    </p>
                  </SubSection>
                  <SubSection title="Response Size Management">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Polymarket event responses can exceed 3.6MB when all nested fields are included. 
                      Next.js&apos;s fetch cache enforces a hard 2MB ceiling, causing application errors if 
                      responses are cached with <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">next: {"{ revalidate }"}</code>. 
                      The pipeline applies a <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">slim()</code> transformation 
                      that keeps only the fields the UI needs, which brings the reply to about 120KB. 
                      The Polymarket route also uses <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">cache: &quot;no-store&quot;</code> instead 
                      of revalidate to completely bypass the cache layer.
                    </p>
                  </SubSection>
                </div>
              </section>

              {/* Intelligence */}
              <section id="intelligence" className="scroll-mt-28">
                <SectionHeader icon={Brain} label="INTELLIGENCE" title="AI Signal Engine" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The label and the AI brief are separate on purpose. A fixed rule decides the label so
                  it's the same everywhere and easy to check. The model only writes the brief.
                </p>
                <div className="space-y-5">
                  <SubSection title="Model Selection">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      openai/gpt-oss-120b on Groq&apos;s inference API. It&apos;s fast, cheap and good at short
                      grounded text. It&apos;s a reasoning model, so it runs with low reasoning effort and a
                      1,200-token output budget, since hidden reasoning counts against that budget. It&apos;s
                      called through the Vercel AI SDK&apos;s <code className="text-primary/80 text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">generateText</code> and
                      returns plain text. An earlier version named mixtral-8x7b-32768, which Groq had
                      already retired, so the brief never worked until this change.
                    </p>
                  </SubSection>
                  <SubSection title="Prompt Architecture">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      One short prompt per market, built from the numbers on the card: the question, the
                      Yes probability, the 24h and 7d moves in percentage points, the 24h volume and the
                      label the rule already gave it. The model is asked for 2 to 3 sentences with a
                      directional stance and no markdown.
                    </p>
                    <CodeBlock title="Brief prompt (app/api/signals/analysis/route.ts)" code={`You are a crypto prediction market analyst. Write a 2-3
sentence brief on this Polymarket market for a trader. Use
the numbers given. No hedging language, no markdown, no lists.

Market: Will Bitcoin reach $95,000 by December 31, 2026?
Current probability (Yes price): 26%
24h change: -1.0 percentage points
7d change: -8.0 percentage points
24h volume: $10K
Signal from our rule: neutral

Say what the move means, what to watch next, and give a
directional stance. Keep it under 70 words.`} />
                  </SubSection>
                </div>
              </section>

              {/* API Reference */}
              <section id="api-reference" className="scroll-mt-28">
                <SectionHeader icon={Code2} label="API REFERENCE" title="API Reference" />
                <p className="text-muted-foreground leading-relaxed mb-8">
                  All API routes are implemented as Next.js Route Handlers. They are server-side only 
                  and should be consumed from client components via SWR or from other server components 
                  via fetch. All responses are JSON.
                </p>
                <div className="space-y-6">
                  {apiEndpoints.map((ep) => (
                    <div key={ep.path} className="glass-card rounded-xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-200">
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30 bg-secondary/20">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-primary/15 text-primary border border-primary/20">
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-foreground">{ep.path}</code>
                      </div>
                      <div className="p-5 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{ep.description}</p>
                        {ep.params.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Parameters</p>
                            <div className="space-y-2">
                              {ep.params.map((p) => (
                                <div key={p.name} className="flex items-start gap-3 text-sm">
                                  <code className="text-primary/80 font-mono text-xs bg-secondary/50 px-1.5 py-0.5 rounded shrink-0">{p.name}</code>
                                  <code className="text-muted-foreground/60 font-mono text-xs shrink-0">{p.type}</code>
                                  {"required" in p && p.required && (
                                    <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded shrink-0">required</span>
                                  )}
                                  {"default" in p && (
                                    <span className="text-[10px] text-muted-foreground shrink-0">default: <code className="font-mono">{p.default}</code></span>
                                  )}
                                  <span className="text-xs text-muted-foreground">{p.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Response</p>
                          <pre className="text-[11px] font-mono text-muted-foreground bg-secondary/30 border border-border/30 rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre">
                            {ep.response}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Signal Types */}
              <section id="signals" className="scroll-mt-28">
                <SectionHeader icon={Zap} label="SIGNALS" title="Signal Classification" />
                <p className="text-muted-foreground leading-relaxed mb-8">
                  The platform emits four signal types. One rule in lib/signals.ts decides them from the
                  24h move, the same rule on every page. Confidence is 70% move size (10pp or more counts
                  in full) and 30% 24h volume ($1M or more counts in full).
                </p>
                <div className="space-y-4">
                  {signalTypes.map((s) => (
                    <div key={s.type} className="glass-card rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          s.color === "emerald" ? "bg-emerald-500" :
                          s.color === "red" ? "bg-red-500" :
                          s.color === "amber" ? "bg-amber-500" : "bg-slate-500"
                        }`} />
                        <h3 className={`font-semibold text-base ${
                          s.color === "emerald" ? "text-emerald-400" :
                          s.color === "red" ? "text-red-400" :
                          s.color === "amber" ? "text-amber-400" : "text-slate-400"
                        }`}>{s.type}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                      <div>
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Emission Criteria</p>
                        <ul className="space-y-1.5">
                          {s.criteria.map((c) => (
                            <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="w-3.5 h-3.5 text-primary/50 mt-0.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Authentication */}
              <section id="auth" className="scroll-mt-28">
                <SectionHeader icon={Lock} label="AUTHENTICATION" title="Authentication" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Accounts aren&apos;t built yet. These are the three sign-in methods the design plans for.
                  Nothing on the live site needs an account.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: Globe, title: "Google OAuth 2.0", desc: "Planned: one-click sign-in with a Google account, tokens exchanged server-side. Not built yet." },
                    { icon: GitBranch, title: "GitHub OAuth", desc: "Planned: sign-in with a GitHub account. Not built yet." },
                    { icon: Lock, title: "Email & Password", desc: "Planned: registration with email verification and passwords hashed with bcrypt before storage. Not built yet." },
                  ].map((m) => (
                    <div key={m.title} className="glass-card rounded-xl p-5">
                      <m.icon className="w-5 h-5 text-primary mb-3" />
                      <h4 className="font-semibold text-foreground text-sm mb-2">{m.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="glass-card rounded-xl p-5 border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-500">Implementation Status</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The sign-in page is a design preview. There&apos;s no database, no OAuth callback and no
                    session handling yet, and the page says so to anyone who tries it.
                  </p>
                </div>
              </section>

              {/* Deployment */}
              <section id="deployment" className="scroll-mt-28">
                <SectionHeader icon={Server} label="DEPLOYMENT" title="Deployment & Infrastructure" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Deploys to Vercel as a standard Next.js app. These are the only environment variables
                  the code reads.
                </p>
                <div className="glass-card rounded-xl overflow-hidden mb-6">
                  <div className="px-5 py-3 border-b border-border/30 bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Required Environment Variables</span>
                    </div>
                  </div>
                  <div className="divide-y divide-border/20">
                    {[
                      { key: "CMC_API_KEY", desc: "CoinMarketCap Pro API key for the /api/coinmarketcap routes (overview cards, top 10, global metrics).", required: true },
                      { key: "GROQ_API_KEY", desc: "Groq Cloud API key for the AI briefs at /api/signals/analysis. Without it, cards show the template line.", required: true },
                    ].map((env) => (
                      <div key={env.key} className="flex items-start gap-4 px-5 py-3">
                        <code className="text-xs font-mono text-primary/80 bg-secondary/50 px-2 py-1 rounded shrink-0 mt-0.5">{env.key}</code>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{env.desc}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                          env.required 
                            ? "bg-destructive/10 text-destructive border border-destructive/20" 
                            : "bg-secondary/60 text-muted-foreground border border-border/30"
                        }`}>
                          {env.required ? "Required" : "Optional"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Integrations */}
              <section id="integrations" className="scroll-mt-28">
                <SectionHeader icon={Plug} label="INTEGRATIONS" title="External Integrations" />
                <p className="text-muted-foreground leading-relaxed mb-6">
                  All external integrations and their current status within the platform.
                </p>
                <div className="space-y-3">
                  {[
                    { name: "Polymarket Gamma API", status: "active", tier: "Free", note: "No API key required. Markets, odds, volume and moves." },
                    { name: "Polymarket CLOB API", status: "active", tier: "Free", note: "No API key required. Price history for sparklines and charts." },
                    { name: "CoinMarketCap Pro API", status: "active", tier: "Basic (Free)", note: "Requires CMC_API_KEY. 10,000 credits/month on free tier." },
                    { name: "CoinGecko API", status: "active", tier: "Free", note: "No API key required. Rate limited, so responses are cached." },
                    { name: "Alternative.me Fear & Greed", status: "active", tier: "Free", note: "No API key required. Updated daily." },
                    { name: "Groq Cloud (gpt-oss-120b)", status: "active", tier: "Pay as you go", note: "Requires GROQ_API_KEY. Briefs cached for 30 minutes." },
                    { name: "TradingView embed widgets", status: "active", tier: "Free", note: "Loaded in the browser. No API key required." },
                    { name: "Vercel Analytics", status: "active", tier: "Free", note: "Enabled via @vercel/analytics package." },
                    { name: "GitHub OAuth", status: "planned", tier: "Free", note: "Not built. Needs an OAuth App and a session store." },
                    { name: "Google OAuth 2.0", status: "planned", tier: "Free", note: "Not built. Needs Google Cloud setup and a session store." },
                  ].map((int) => (
                    <div key={int.name} className="glass-card rounded-lg p-4 flex items-start gap-4">
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 mt-0.5 ${
                        int.status === "active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${int.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {int.status}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground">{int.name}</span>
                          <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-1.5 py-0.5 rounded border border-border/20">{int.tier}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{int.note}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Stack */}
                <div className="mt-10">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Technology Stack
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {techStack.map((cat) => (
                      <div key={cat.category} className="glass-card rounded-lg p-4">
                        <p className="text-[10px] font-semibold tracking-widest text-primary uppercase mb-3">{cat.category}</p>
                        <div className="space-y-1.5">
                          {cat.items.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="w-3 h-3 text-primary/40 shrink-0" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CTA */}
              <div className="glass-card rounded-2xl p-8 text-center border border-primary/15">
                <Settings2 className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">See it live</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  No account needed. The signal feed, predictions, trending markets and charts all run
                  on live data right now.
                </p>
                <Link href="/signals">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-6 text-sm shadow-lg shadow-primary/20">
                    Open Signals
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label, title }: { icon: React.ElementType; label: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">{label}</span>
      </div>
      <h2 className="text-2xl font-bold text-foreground font-heading">{title}</h2>
    </div>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <ChevronRight className="w-3.5 h-3.5 text-primary" />
        {title}
      </h4>
      {children}
    </div>
  )
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border/30">
      <div className="px-4 py-2 bg-secondary/40 border-b border-border/30">
        <span className="text-[10px] font-mono text-muted-foreground">{title}</span>
      </div>
      <pre className="text-[10px] font-mono text-muted-foreground bg-secondary/20 p-4 overflow-x-auto leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  )
}
