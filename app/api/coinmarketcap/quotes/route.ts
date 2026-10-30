import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const CMC_API_KEY = process.env.CMC_API_KEY || "••••••••••••••••"
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

// Get quotes for specific symbols
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols") || "BTC,ETH,SOL,XRP,DOGE,BNB,ADA,AVAX,LINK,DOT"
  const convert = searchParams.get("convert") || "USD"

  try {
    const response = await fetch(
      `${CMC_BASE_URL}/cryptocurrency/quotes/latest?symbol=${symbols}&convert=${convert}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": CMC_API_KEY,
          "Accept": "application/json",
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[CMC Quotes API] Error:", response.status, errorText)
      return NextResponse.json(
        { error: "CoinMarketCap API error", status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.status.error_code !== 0) {
      return NextResponse.json(
        { error: data.status.error_message },
        { status: 400 }
      )
    }

    // Transform data - data is keyed by symbol
    const transformedData = Object.values(data.data).map((coin: any) => ({
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

    // Sort by market cap rank
    transformedData.sort((a: any, b: any) => a.rank - b.rank)

    return NextResponse.json({
      data: transformedData,
      timestamp: data.status.timestamp,
      creditCount: data.status.credit_count,
    })
  } catch (error) {
    console.error("[CMC Quotes API] Fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch CoinMarketCap quotes" },
      { status: 500 }
    )
  }
}
