import { NextRequest, NextResponse } from "next/server"

// Yes-price history for one market, from Polymarket's public CLOB API.
// Cached for 5 minutes per token and range, so many visitors share one upstream call.

const RANGES = {
  "1d": { interval: "1d", fidelity: 60 },
  "1w": { interval: "1w", fidelity: 360 },
  "1m": { interval: "1m", fidelity: 1440 },
  max: { interval: "max", fidelity: 1440 },
} as const

type Range = keyof typeof RANGES

const MAX_POINTS = 120

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token") ?? ""
  const range = (searchParams.get("range") ?? "1d") as Range

  if (!/^\d{10,100}$/.test(token) || !(range in RANGES)) {
    return NextResponse.json({ error: "Expected a numeric token and range of 1d, 1w, 1m or max" }, { status: 400 })
  }

  const { interval, fidelity } = RANGES[range]

  try {
    const res = await fetch(
      `https://clob.polymarket.com/prices-history?market=${token}&interval=${interval}&fidelity=${fidelity}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 300 } },
    )
    if (!res.ok) {
      return NextResponse.json({ points: [], error: `CLOB answered ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const raw: Array<{ t: number; p: number }> = Array.isArray(data?.history) ? data.history : []
    let points = raw
      .filter((d) => Number.isFinite(d?.t) && Number.isFinite(d?.p))
      .map((d) => ({ t: d.t, p: Math.round(d.p * 1000) / 10 }))

    if (points.length > MAX_POINTS) {
      const step = points.length / MAX_POINTS
      const sampled = Array.from({ length: MAX_POINTS }, (_, i) => points[Math.floor(i * step)])
      sampled[sampled.length - 1] = points[points.length - 1]
      points = sampled
    }

    return NextResponse.json(
      { points },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    )
  } catch {
    return NextResponse.json({ points: [], error: "CLOB request failed" }, { status: 502 })
  }
}
