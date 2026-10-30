import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Check,
  ArrowRight,
  Zap,
  Shield,
  Code,
  Users,
  Palette,
  Database,
} from "lucide-react"

const whatsIncluded = [
  {
    category: "Codebase",
    icon: Code,
    items: [
      "Complete Next.js 16 application",
      "TypeScript with strict mode",
      "Tailwind CSS + shadcn/ui",
      "All components and pages",
      "API route handlers",
      "Type definitions",
    ],
  },
  {
    category: "Data Pipeline",
    icon: Database,
    items: [
      "Polymarket API integration",
      "Data normalization layer",
      "Caching infrastructure",
      "Error handling",
      "CDN cache headers",
      "Price history route",
    ],
  },
  {
    category: "AI System",
    icon: Zap,
    items: [
      "Groq integration",
      "Signal generation prompts",
      "Analysis templates",
      "Confidence scoring",
      "Rule-based signal labels",
      "Custom tuning ready",
    ],
  },
  {
    category: "User System",
    icon: Users,
    items: [
      "Sign-in page design (not wired)",
      "Saved signals in the browser",
      "Account backend not built",
      "No notifications yet",
      "No sessions yet",
      "No password recovery yet",
    ],
  },
  {
    category: "White Label",
    icon: Palette,
    items: [
      "Theme configuration",
      "Logo replacement",
      "Color scheme system",
      "Font customization",
      "Branding assets",
      "Domain setup guide",
    ],
  },
  {
    category: "Deployment",
    icon: Shield,
    items: [
      "Vercel configuration",
      "Environment setup",
      "Edge optimization",
      "CI/CD pipeline",
      "Monitoring setup",
      "Documentation",
    ],
  },
]

const pricingTiers = [
  {
    name: "License",
    price: "$4,500",
    description: "Full source code license with unlimited deployment rights",
    features: [
      "Complete source code",
      "All integrations",
      "Documentation",
      "1 year updates",
      "Email support",
    ],
    cta: "Request License",
    highlighted: false,
  },
  {
    name: "Acquisition",
    price: "$12,000",
    description: "Full ownership transfer including brand and domain",
    features: [
      "Everything in License",
      "Full IP transfer",
      "Domain transfer",
      "Brand assets",
      "30-day handover support",
      "Architecture walkthrough",
    ],
    cta: "Discuss Acquisition",
    highlighted: true,
  },
  {
    name: "Custom Build",
    price: "Contact",
    description: "Custom modifications or new platform development",
    features: [
      "Custom features",
      "Additional integrations",
      "Design modifications",
      "Extended support",
      "Maintenance contract",
    ],
    cta: "Start Conversation",
    highlighted: false,
  },
]

export default function AcquisitionPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Acquisition Details
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Acquire TheCryptoPulse
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete prediction market intelligence platform ready for 
              immediate deployment or white-label customization.
            </p>
          </div>

          {/* What's Included */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                {"What's Included"}
              </h2>
              <p className="text-muted-foreground">
                Every component you need to run a prediction market intelligence platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whatsIncluded.map((section, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{section.category}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
                Pricing Options
              </h2>
              <p className="text-muted-foreground">
                Choose the option that fits your needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative glass-card rounded-xl p-6 ${
                    tier.highlighted
                      ? "border-primary/50 glow-accent"
                      : ""
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Recommended
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-3xl font-bold text-primary mb-2">
                      {tier.price}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Development Value Comparison */}
          <div className="max-w-3xl mx-auto text-center p-8 rounded-xl bg-card/30 border border-border/30">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Development Equivalent
            </h3>
            <p className="text-muted-foreground mb-6">
              Building this platform from scratch with an agency would cost{" "}
              <span className="text-foreground font-semibold">$25,000–$40,000</span>{" "}
              and take 2–3 months. TheCryptoPulse is ready to deploy today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/architecture">
                <Button variant="outline" className="border-border/50 hover:bg-secondary/50">
                  View Architecture
                </Button>
              </Link>
              <Link href="/predictions">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  See It Live
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
