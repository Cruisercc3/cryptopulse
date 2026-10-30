import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/hero-section"
import { MetricsBar } from "@/components/home/metrics-bar"
import { HowItWorks } from "@/components/home/how-it-works"
import { SignalPlatform } from "@/components/home/signal-platform"
import { LivePreview } from "@/components/home/live-preview"
import { LiveFlippingCards } from "@/components/home/live-flipping-cards"
import { DataSources } from "@/components/home/data-sources"
import { UseCases } from "@/components/home/use-cases"
import { Capabilities } from "@/components/home/capabilities"
import { DevelopmentValue } from "@/components/home/development-value"
import { WhiteLabel } from "@/components/home/white-label"
import { TechStack } from "@/components/home/tech-stack"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <LiveFlippingCards />
      <MetricsBar />
      <HowItWorks />
      <SignalPlatform />
      <LivePreview />
      <DataSources />
      <UseCases />
      <Capabilities />
      <DevelopmentValue />
      <WhiteLabel />
      <TechStack />
      <Footer />
    </main>
  )
}
