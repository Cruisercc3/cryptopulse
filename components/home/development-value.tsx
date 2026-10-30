import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DevelopmentValue() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Label */}
          <p className="text-xs font-medium tracking-wider text-primary mb-4">
            DEVELOPMENT EQUIVALENT
          </p>

          {/* Heading */}
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6 text-balance">
            What would this cost to build?
          </h2>

          {/* Body */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            An agency building a prediction market intelligence platform with live 
            Polymarket API integration, AI signal analysis, probability charting on 
            TradingView, filtering and discovery, complete user system, and full 
            platform infrastructure would quote{" "}
            <span className="text-foreground font-semibold">$25,000–$40,000</span>{" "}
            and deliver in 2–3 months.
          </p>

          {/* Cost highlight */}
          <div className="glass-card rounded-2xl p-8 mb-8 inline-block">
            <p className="text-4xl lg:text-5xl font-bold text-primary mb-2">~$1/month</p>
            <p className="text-muted-foreground">
              All data from free public APIs
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/architecture">
              <Button size="lg" variant="outline" className="border-border/50 hover:bg-secondary/50 font-medium px-6">
                View Architecture
              </Button>
            </Link>
            <Link href="/acquisition">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                Acquisition Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
