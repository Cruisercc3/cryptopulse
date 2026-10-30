const technologies = [
  "Next.js 16",
  "TypeScript",
  "Tailwind CSS",
  "Polymarket API",
  "TradingView",
  "Groq AI",
  "Vercel",
]

export function TechStack() {
  return (
    <section className="py-12 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tech}
              {index < technologies.length - 1 && (
                <span className="ml-6 text-border/50">·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
