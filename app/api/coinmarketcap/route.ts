import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const CMC_API_KEY = process.env.CMC_API_KEY || "••••••••••••••••"
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

export interface CMCQuote {
  id: number
  name: string
  symbol: string
  slug: string
  cmc_rank: number
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  infinite_supply: boolean
  last_updated: string
  date_added: string
  tags: string[]
  quote: {
    USD: {
      price: number
      volume_24h: number
      volume_change_24h: number
      percent_change_1h: number
      percent_change_24h: number
      percent_change_7d: number
      percent_change_30d: number
      percent_change_60d: number
      percent_change_90d: number
      market_cap: number
      market_cap_dominance: number
      fully_diluted_market_cap: number
      last_updated: string
    }
  }
}

export interface CMCResponse {
  data: CMCQuote[]
  status: {
    timestamp: string
    error_code: number
    error_message: string | null
    elapsed: number
    credit_count: number
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200)
  const start = parseInt(searchParams.get("start") || "1", 10)
  const convert = searchParams.get("convert") || "USD"
  const sort = searchParams.get("sort") || "market_cap"
  const sortDir = searchParams.get("sort_dir") || "desc"

  try {
    const response = await fetch(
      `${CMC_BASE_URL}/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${convert}&sort=${sort}&sort_dir=${sortDir}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": CMC_API_KEY,
          "Accept": "application/json",
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[CMC API] Error:", response.status, errorText)
      return NextResponse.json(
        { error: "CoinMarketCap API error", status: response.status },
        { status: response.status }
      )
    }

    const data: CMCResponse = await response.json()
    
    if (data.status.error_code !== 0) {
      return NextResponse.json(
        { error: data.status.error_message },
        { status: 400 }
      )
    }

    // Transform data for frontend consumption
    const transformedData = data.data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      slug: coin.slug,
      rank: coin.cmc_rank,
      price: coin.quote.USD.price,
      volume24h: coin.quote.USD.volume_24h,
      volumeChange24h: coin.quote.USD.volume_change_24h,
      percentChange1h: coin.quote.USD.percent_change_1h,
      percentChange24h: coin.quote.USD.percent_change_24h,
      percentChange7d: coin.quote.USD.percent_change_7d,
      percentChange30d: coin.quote.USD.percent_change_30d,
      marketCap: coin.quote.USD.market_cap,
      marketCapDominance: coin.quote.USD.market_cap_dominance,
      fullyDilutedMarketCap: coin.quote.USD.fully_diluted_market_cap,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      lastUpdated: coin.quote.USD.last_updated,
      tags: coin.tags,
    }))

    return NextResponse.json({
      data: transformedData,
      timestamp: data.status.timestamp,
      creditCount: data.status.credit_count,
    })
  } catch (error) {
    console.error("[CMC API] Fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch CoinMarketCap data" },
      { status: 500 }
    )
  }
}
