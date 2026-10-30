import { NextRequest, NextResponse } from "next/server"
import { unstable_cache } from "next/cache"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export const dynamic = "force-dynamic"

// gpt-oss-120b is a reasoning model. Its hidden reasoning counts against
// maxOutputTokens, so effort stays low and the budget leaves room for the answer.
const MODEL_ID = "openai/gpt-oss-120b"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

interface BriefInput {
  question: string
  probability: number
  change24h: number
  change7d: number
  volume24h: number
  signalType: string
}

function formatVolume(v: number): string {
  if (!v) return "no recorded"
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
  return `$${v.toFixed(0)}`
}

async function writeBrief(input: BriefInput): Promise<string> {
  const prompt = `You are a crypto prediction market analyst. Write a 2-3 sentence brief on this Polymarket market for a trader. Use the numbers given. No hedging language, no markdown, no lists.

Market: ${input.question}
Current probability (Yes price): ${input.probability}%
24h change: ${input.change24h.toFixed(1)} percentage points
7d change: ${input.change7d.toFixed(1)} percentage points
24h volume: ${formatVolume(input.volume24h)}
Signal from our rule: ${input.signalType}

Say what the move means, what to watch next, and give a directional stance. Keep it under 70 words.`

  const { text } = await generateText({
    model: groq(MODEL_ID),
    prompt,
    maxOutputTokens: 1200,
    temperature: 0.6,
    providerOptions: { groq: { reasoningEffort: "low" } },
  })

  const brief = text.trim()
  if (!brief) throw new Error("Model returned no text")
  return brief
}

// Briefs are cached for 30 minutes per market and rounded state, so repeat
// visitors share one model call. A failed call throws and is never cached.
const cachedBrief = unstable_cache(
  async (_key: string, input: BriefInput) => writeBrief(input),
  ["signal-brief-v2"],
  { revalidate: 1800 },
)

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const question = typeof body?.question === "string" ? body.question.slice(0, 300) : ""
  const probability = Number(body?.probability)
  if (!question || !Number.isFinite(probability)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY is not set" }, { status: 503 })
  }

  // Rounded so small ticks between polls hit the same cache entry.
  const round1 = (n: unknown) => Math.round((Number(n) || 0) * 10) / 10
  const input: BriefInput = {
    question,
    // Whole numbers in the middle, one decimal near 0% and 100% so a 0.4% market isn't sent as "0%"
    probability: probability < 5 || probability > 95 ? Math.round(probability * 10) / 10 : Math.round(probability),
    change24h: round1(body?.change24h),
    change7d: round1(body?.change7d),
    volume24h: Math.round((Number(body?.volume24h) || 0) / 1000) * 1000,
    signalType: ["bullish", "bearish", "contrarian", "neutral"].includes(body?.signalType)
      ? body.signalType
      : "neutral",
  }

  const id = typeof body?.id === "string" ? body.id.slice(0, 40) : question

  try {
    const analysis = await cachedBrief(id, input)
    return NextResponse.json({ analysis, source: "model", model: MODEL_ID })
  } catch (err) {
    console.error("[signals/analysis] generation failed:", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "AI brief unavailable" }, { status: 502 })
  }
}
