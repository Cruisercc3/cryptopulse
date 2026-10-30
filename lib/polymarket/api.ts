/**
 * Polymarket API Service
 * Custom implementation using native fetch() for market discovery and pricing
 * 
 * APIs:
 * - Gamma API: Market/event discovery
 * - CLOB API: Pricing, midpoints, spreads
 */

export interface PolymarketEvent {
  id: string
  slug: string
  title: string
  description: string
  startDate: string
  endDate: string
  image: string
  icon: string
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  restricted: boolean
  liquidity: number
  volume: number
  openInterest: number
  createdAt: string
  updatedAt: string
  enableOrderBook: boolean
  markets: PolymarketMarket[]
}

export interface PolymarketMarket {
  id: string
  question: string
  conditionId: string
  slug: string
  resolutionSource: string
  endDate: string
  liquidity: number
  volume: number
  volume24hr: number
  openInterest: number
  outcomePrices: string // JSON string of prices like "[0.65, 0.35]"
  outcomes: string // JSON string like '["Yes", "No"]'
  clobTokenIds: string // JSON string of token IDs
  acceptingOrders: boolean
  active: boolean
  closed: boolean
  archived: boolean
  new: boolean
  featured: boolean
  submitted_by: string
  createdAt: string
  updatedAt: string
  competitorCount: number
  spread: number
  oneDayPriceChange: number
  lastTradePrice: number
  bestBid: number
  bestAsk: number
}

export interface ParsedMarket {
  id: string
  question: string
  slug: string
  probability: number
  change24h: number
  volume: number
  volume24h: number
  liquidity: number
  outcomes: string[]
  outcomePrices: number[]
  endDate: string
  active: boolean
  clobTokenIds: string[]
  spread: number
  bestBid: number
  bestAsk: number
}

export interface GammaMarketsResponse {
  data: PolymarketMarket[]
  next_cursor?: string
}

// Use our proxy API to avoid CORS issues
const API_PROXY_BASE = "/api/polymarket"

// CLOB API endpoints (for server-side only)
const CLOB_API_BASE = "https://clob.polymarket.com"

// Gamma API (for server-side only)
const GAMMA_API_BASE = "https://gamma-api.polymarket.com"

/**
 * Fetch trending/active markets via our proxy API
 */
export async function fetchTrendingMarkets(
  limit: number = 20,
  offset: number = 0
): Promise<ParsedMarket[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      cryptoOnly: "false",
    })

    const response = await fetch(`${API_PROXY_BASE}/markets?${params}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Route returns a plain array
    const markets: PolymarketMarket[] = await response.json()
    return (Array.isArray(markets) ? markets : []).map(parseMarket)
  } catch (error) {
    throw error
  }
}

/**
 * Fetch crypto-related markets via our proxy API
 */
export async function fetchCryptoMarkets(
  limit: number = 30
): Promise<ParsedMarket[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      cryptoOnly: "true",
    })

    const response = await fetch(`${API_PROXY_BASE}/markets?${params}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Route returns a plain array
    const markets: PolymarketMarket[] = await response.json()
    return (Array.isArray(markets) ? markets : []).map(parseMarket)
  } catch (error) {
    throw error
  }
}

/**
 * Fetch markets by category/tag search
 */
export async function searchMarkets(
  query: string,
  limit: number = 20
): Promise<ParsedMarket[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      active: "true",
      closed: "false",
      tag_slug: query.toLowerCase(),
    })

    const response = await fetch(`${GAMMA_API_BASE}/markets?${params}`, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Gamma API search error: ${response.status}`)
    }

    const markets: PolymarketMarket[] = await response.json()
    return markets.map(parseMarket)
  } catch (error) {
    console.error("[v0] Failed to search markets:", error)
    throw error
  }
}

/**
 * Fetch a single market by ID
 */
export async function fetchMarketById(marketId: string): Promise<ParsedMarket | null> {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/markets/${marketId}`, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Gamma API error: ${response.status}`)
    }

    const market: PolymarketMarket = await response.json()
    return parseMarket(market)
  } catch (error) {
    console.error("[v0] Failed to fetch market:", error)
    throw error
  }
}

/**
 * Fetch multiple markets by IDs
 */
export async function fetchMarketsByIds(marketIds: string[]): Promise<ParsedMarket[]> {
  try {
    const promises = marketIds.map(id => fetchMarketById(id))
    const results = await Promise.all(promises)
    return results.filter((m): m is ParsedMarket => m !== null)
  } catch (error) {
    console.error("[v0] Failed to fetch markets by IDs:", error)
    throw error
  }
}

/**
 * Fetch price/midpoint from CLOB API
 */
export async function fetchMidpoint(tokenId: string): Promise<number | null> {
  try {
    const response = await fetch(`${CLOB_API_BASE}/midpoint?token_id=${tokenId}`, {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`)
    }

    const data = await response.json()
    return data.mid ? parseFloat(data.mid) : null
  } catch (error) {
    console.error("[v0] Failed to fetch midpoint:", error)
    return null
  }
}

/**
 * Fetch price history for a token
 */
export async function fetchPriceHistory(
  tokenId: string,
  interval: "1m" | "5m" | "1h" | "1d" = "1h",
  fidelity: number = 60
): Promise<{ t: number; p: number }[]> {
  try {
    const response = await fetch(
      `${CLOB_API_BASE}/prices-history?market=${tokenId}&interval=${interval}&fidelity=${fidelity}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CLOB price history error: ${response.status}`)
    }

    const data = await response.json()
    return data.history || []
  } catch (error) {
    console.error("[v0] Failed to fetch price history:", error)
    return []
  }
}

/**
 * Parse raw market data into a cleaner format
 */
function parseMarket(market: PolymarketMarket): ParsedMarket {
  let outcomes: string[] = ["Yes", "No"]
  let outcomePrices: number[] = [0.5, 0.5]
  let clobTokenIds: string[] = []

  try {
    if (market.outcomes) {
      outcomes = JSON.parse(market.outcomes)
    }
    if (market.outcomePrices) {
      outcomePrices = JSON.parse(market.outcomePrices).map((p: string) => parseFloat(p))
    }
    if (market.clobTokenIds) {
      clobTokenIds = JSON.parse(market.clobTokenIds)
    }
  } catch {
    // Keep defaults if parsing fails
  }

  // Calculate probability as "Yes" price (first outcome typically)
  const probability = outcomePrices[0] * 100

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    probability: Math.round(probability * 10) / 10,
    change24h: market.oneDayPriceChange * 100 || 0,
    volume: market.volume || 0,
    volume24h: market.volume24hr || 0,
    liquidity: market.liquidity || 0,
    outcomes,
    outcomePrices,
    endDate: market.endDate,
    active: market.active,
    clobTokenIds,
    spread: market.spread || 0,
    bestBid: market.bestBid || 0,
    bestAsk: market.bestAsk || 0,
  }
}

/**
 * Format volume for display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(0)}K`
  }
  return `$${volume.toFixed(0)}`
}

/**
 * Signal labels live in one place now: classifySignal in lib/signals.ts.
 */
export { classifySignal } from "@/lib/signals"
