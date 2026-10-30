import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HeroMarketCard } from "@/components/home/hero-market-card"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-primary">
                Live Polymarket Data · AI-Powered
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
                TheCryptoPulse
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-medium">
                Prediction Market Intelligence for Crypto Traders
              </p>
            </div>

            {/* Body */}
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              Transform prediction market probabilities into trading signals. 
              TheCryptoPulse reads live data from Polymarket, the world's largest
              prediction market, keeps the crypto markets, labels each probability move
              with one fixed rule and has an AI model write a short brief on it.
              Real data. Real analysis. Real signals.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/predictions">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 px-6">
                  Explore Predictions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/architecture">
                <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50 font-medium px-6">
                  View Architecture
                </Button>
              </Link>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {["Next.js 16", "Polymarket API", "Groq AI", "TradingView"].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 text-xs font-medium text-muted-foreground bg-secondary/50 rounded-md border border-border/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Preview Card */}
          <div className="relative">
            <HeroMarketCard />

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
