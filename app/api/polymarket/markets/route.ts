import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Visitors poll every 30 s. Let the CDN answer repeat requests for 20 s.
const CDN_CACHE = { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" }

// Only the fields the client actually needs — keeps response well under 2MB
function slim(m: any, eventSlug: string, eventTitle: string) {
  return {
    id: m.id,
    question: m.question,
    slug: m.slug,
    eventSlug,
    eventTitle,
    outcomePrices: m.outcomePrices,
    outcomes: m.outcomes,
    clobTokenIds: m.clobTokenIds,
    volume: m.volume,
    volumeNum: m.volumeNum,
    volume24hr: m.volume24hr,
    volume1wk: m.volume1wk,
    volume1mo: m.volume1mo,
    liquidity: m.liquidity,
    liquidityNum: m.liquidityNum,
    openInterest: m.openInterest,
    oneDayPriceChange: m.oneDayPriceChange,
    oneWeekPriceChange: m.oneWeekPriceChange,
    oneMonthPriceChange: m.oneMonthPriceChange,
    lastTradePrice: m.lastTradePrice,
    bestBid: m.bestBid,
    bestAsk: m.bestAsk,
    spread: m.spread,
    endDate: m.endDate,
    active: m.active,
    closed: m.closed,
    archived: m.archived,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 150)

  try {
    // cache: "no-store" because the raw events reply (1.4 to 3.6 MB) is over Next's
    // 2 MB fetch-cache limit. The slim reply below is cached at the CDN instead.
    const eventsRes = await fetch(
      `https://gamma-api.polymarket.com/events?active=true&closed=false&archived=false&tag_slug=crypto&limit=30&order=volume&ascending=false`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    )

    if (!eventsRes.ok) {
      return NextResponse.json([], { status: 200 })
    }

    const events = await eventsRes.json()

    // Flatten events → markets, keeping only slim fields
    const markets: any[] = []
    for (const event of Array.isArray(events) ? events : []) {
      if (Array.isArray(event.markets)) {
        for (const m of event.markets) {
          if (m.active && !m.closed && !m.archived) {
            markets.push(slim(m, event.slug, event.title))
          }
        }
      }
    }

    // Fallback: keyword scan on /markets endpoint if events returned nothing
    if (markets.length < 5) {
      const fallback = await fetch(
        `https://gamma-api.polymarket.com/markets?active=true&closed=false&archived=false&limit=200&order=volumeNum&ascending=false`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      )
      if (fallback.ok) {
        const all = await fallback.json()
        const KEYWORDS = [
          "btc", "bitcoin", "eth", "ethereum", "solana", "sol", "crypto", "defi",
          "nft", "xrp", "ripple", "doge", "dogecoin", "bnb", "cardano", "ada",
          "polygon", "matic", "avax", "avalanche", "chainlink", "usdc", "stablecoin",
          "web3", "blockchain", "token", "coinbase", "binance", "wallet", "memecoin",
          "pepe", "shib", "halving", "etf", "layer 2", "microstrategy", "saylor",
        ]
        const filtered = (Array.isArray(all) ? all : []).filter((m: any) => {
          const text = `${m.question || ""} ${m.description || ""}`.toLowerCase()
          return KEYWORDS.some(k => text.includes(k))
        })
        const slimmed = filtered.map((m: any) => slim(m, m.slug, m.question))
        return NextResponse.json(slimmed.slice(0, limit), { headers: CDN_CACHE })
      }
    }

    // Sort by volume descending, return up to limit
    markets.sort((a, b) => (b.volumeNum || 0) - (a.volumeNum || 0))
    return NextResponse.json(markets.slice(0, limit), { headers: CDN_CACHE })

  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
