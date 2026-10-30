import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const CMC_API_KEY = process.env.CMC_API_KEY || "••••••••••••••••"
const CMC_BASE_URL = "https://pro-api.coinmarketcap.com/v1"

// Get global market metrics
export async function GET() {
  try {
    const response = await fetch(
      `${CMC_BASE_URL}/global-metrics/quotes/latest?convert=USD`,
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
      console.error("[CMC Global API] Error:", response.status, errorText)
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

    const global = data.data
    const quote = global.quote.USD

    return NextResponse.json({
      totalMarketCap: quote.total_market_cap,
      totalVolume24h: quote.total_volume_24h,
      btcDominance: global.btc_dominance,
      ethDominance: global.eth_dominance,
      activeCoins: global.active_cryptocurrencies,
      activeExchanges: global.active_exchanges,
      totalMarketCapChange24h: quote.total_market_cap_yesterday_percentage_change,
      totalVolume24hChange: quote.total_volume_24h_yesterday_percentage_change,
      altcoinMarketCap: quote.altcoin_market_cap,
      altcoinVolume24h: quote.altcoin_volume_24h,
      defiMarketCap: global.defi_market_cap,
      defiVolume24h: global.defi_24h_percentage_change,
      stablecoinMarketCap: global.stablecoin_market_cap,
      stablecoinVolume24h: global.stablecoin_24h_percentage_change,
      lastUpdated: global.last_updated,
      timestamp: data.status.timestamp,
    })
  } catch (error) {
    console.error("[CMC Global API] Fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch global market metrics" },
      { status: 500 }
    )
  }
}
