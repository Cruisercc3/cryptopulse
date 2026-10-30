import { Zap } from "lucide-react"

const brandExamples = [
  {
    name: "SignalForge",
    accent: "from-blue-500 to-cyan-500",
    accentBg: "bg-blue-500",
  },
  {
    name: "PredictIQ",
    accent: "from-violet-500 to-purple-500",
    accentBg: "bg-violet-500",
  },
  {
    name: "OracleHub",
    accent: "from-emerald-500 to-teal-500",
    accentBg: "bg-emerald-500",
  },
]

export function WhiteLabel() {
  return (
    <section className="py-24 bg-card/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              Your Intelligence Platform. Your Brand.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              TheCryptoPulse is white-label-ready. Replace the logo, accent colors, 
              and domain. The data pipeline, AI engine, and platform architecture 
              work immediately under any brand.
            </p>
          </div>

          {/* Brand mockups */}
          <div className="grid md:grid-cols-3 gap-6">
            {brandExamples.map((brand, index) => (
              <div
                key={index}
                className="glass-card rounded-xl overflow-hidden hover:border-border/50 transition-all duration-300"
              >
                {/* Mini navbar */}
                <div className="bg-secondary/30 px-4 py-3 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-md ${brand.accentBg} flex items-center justify-center`}>
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {brand.name}
                      </span>
                    </div>
                    <div className={`w-16 h-6 rounded-md bg-gradient-to-r ${brand.accent}`} />
                  </div>
                </div>

                {/* Content preview */}
                <div className="p-4 space-y-3">
                  <div className="h-2.5 bg-secondary rounded-full w-3/4" />
                  <div className="h-2 bg-secondary/50 rounded-full w-full" />
                  <div className="h-2 bg-secondary/50 rounded-full w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <div className={`h-7 w-20 rounded-md bg-gradient-to-r ${brand.accent}`} />
                    <div className="h-7 w-16 rounded-md border border-border/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
