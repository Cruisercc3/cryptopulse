import { NextResponse } from "next/server"

export const runtime = "edge"
export const revalidate = 300 // 5 min cache

export interface FearGreedEntry {
  value: number
  classification: string
  timestamp: number
  timeUntilUpdate?: number
}

export interface FearGreedResponse {
  current: FearGreedEntry
  yesterday: FearGreedEntry | null
  history: FearGreedEntry[]
}

function classify(v: number): string {
  if (v <= 24) return "Extreme Fear"
  if (v <= 44) return "Fear"
  if (v <= 55) return "Neutral"
  if (v <= 74) return "Greed"
  return "Extreme Greed"
}

export async function GET() {
  try {
    // Fetch last 30 days for history + today + yesterday
    const res = await fetch("https://api.alternative.me/fng/?limit=30", {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`alternative.me API error: ${res.status}`)
    }

    const json = await res.json()

    if (!json?.data || !Array.isArray(json.data)) {
      throw new Error("Invalid response structure from alternative.me")
    }

    const entries: FearGreedEntry[] = json.data.map((d: any) => ({
      value: parseInt(d.value, 10),
      classification: d.value_classification ?? classify(parseInt(d.value, 10)),
      timestamp: parseInt(d.timestamp, 10),
      timeUntilUpdate: d.time_until_update ? parseInt(d.time_until_update, 10) : undefined,
    }))

    // entries[0] = today (most recent), entries[1] = yesterday
    const payload: FearGreedResponse = {
      current: entries[0],
      yesterday: entries[1] ?? null,
      history: entries.slice(0, 30).reverse(), // oldest first for charting
    }

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error("[fear-greed] fetch error:", err.message)
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch Fear & Greed data" },
      { status: 500 }
    )
  }
}
