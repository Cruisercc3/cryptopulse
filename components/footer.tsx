import Link from "next/link"
import { Zap } from "lucide-react"

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { name: "Predictions", href: "/predictions" },
      { name: "Signal Analysis", href: "/signals" },
      { name: "Charts", href: "/charts" },
      { name: "Trending", href: "/trending" },
      { name: "Leaderboard", href: "/leaderboard" },
    ],
  },
  company: {
    title: "Project",
    links: [
      { name: "Architecture", href: "/architecture" },
      { name: "Acquisition", href: "/acquisition" },
      { name: "Source on GitHub", href: "https://github.com/Cruisercc3/cryptopulse" },
    ],
  },
  support: {
    title: "Docs",
    links: [
      { name: "API Docs", href: "/docs" },
      { name: "Data Sources", href: "/docs#data-layer" },
      { name: "Signal Rule", href: "/docs#signals" },
    ],
  },
  data: {
    title: "Data",
    links: [
      { name: "Polymarket", href: "https://polymarket.com" },
      { name: "CoinGecko", href: "https://www.coingecko.com" },
      { name: "Fear & Greed", href: "https://alternative.me/crypto/fear-and-greed-index/" },
    ],
  },
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">TheCryptoPulse</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Prediction Market Intelligence Infrastructure
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Complete platform available for acquisition.
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-medium text-foreground mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60">
            © 2026 Conor Cruise. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span>Next.js 16</span>
            <span>·</span>
            <span>TypeScript</span>
            <span>·</span>
            <span>Tailwind CSS</span>
            <span>·</span>
            <span>Polymarket API</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
