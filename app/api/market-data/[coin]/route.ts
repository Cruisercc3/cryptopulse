import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface MarketDataResponse {
  rsi: number | null
  rsiLabel: "Overbought" | "Neutral" | "Oversold" | null
  macd: "bullish" | "bearish" | null
  macdValue: number | null
  currentPrice: number | null
  priceChange24h: number | null
  priceChange7d: number | null
  priceChange30d: number | null
  marketCap: number | null
  volume24h: number | null
  source: "coingecko"
}

// CoinGecko ids this route serves. Anything else is a 404, so the route
// can't be used to proxy arbitrary CoinGecko paths.
const SUPPORTED_COINS = new Set([
  "bitcoin",
  "ethereum",
  "solana",
  "ripple",
  "binancecoin",
  "dogecoin",
  "cardano",
  "avalanche-2",
  "chainlink",
  "matic-network",
])

// Calculate EMA (Exponential Moving Average)
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)

  // First EMA is SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }
  ema[period - 1] = sum / period

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1]
  }

  return ema
}

// Calculate RSI using Wilder's smoothing method (14-period)
function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null

  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  let avgGain = 0
  let avgLoss = 0

  // First average: simple average of first 'period' changes
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }
  avgGain /= period
  avgLoss /= period

  // Apply Wilder's smoothing for remaining values
  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

// Calculate MACD (12-period EMA, 26-period EMA, 9-period signal)
function calculateMACD(prices: number[]): { value: number; direction: "bullish" | "bearish" } | null {
  if (prices.length < 26) return null

  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)

  // MACD line = 12-period EMA - 26-period EMA
  const macdLine: number[] = []
  for (let i = 25; i < prices.length; i++) {
    if (ema12[i] !== undefined && ema26[i] !== undefined) {
      macdLine.push(ema12[i] - ema26[i])
    }
  }

  if (macdLine.length < 9) return null

  // Signal line = 9-period EMA of MACD line
  const signalLine = calculateEMA(macdLine, 9)
  
  const latestMACD = macdLine[macdLine.length - 1]
  const latestSignal = signalLine[signalLine.length - 1]

  return {
    value: latestMACD,
    direction: latestMACD > latestSignal ? "bullish" : "bearish",
  }
}

function getRSILabel(rsi: number): "Overbought" | "Neutral" | "Oversold" {
  if (rsi > 70) return "Overbought"
  if (rsi < 30) return "Oversold"
  return "Neutral"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coin: string }> }
) {
  const { coin } = await params

  if (!SUPPORTED_COINS.has(coin)) {
    return NextResponse.json({ error: `Unsupported coin: ${coin}` }, { status: 404 })
  }

  const response: MarketDataResponse = {
    rsi: null,
    rsiLabel: null,
    macd: null,
    macdValue: null,
    currentPrice: null,
    priceChange24h: null,
    priceChange7d: null,
    priceChange30d: null,
    marketCap: null,
    volume24h: null,
    source: "coingecko",
  }

  // Both calls are CoinGecko's free public API, no key needed.
  const [spotResult, ohlcResult] = await Promise.allSettled([
    // 1. Spot price, 24h/7d/30d change, market cap and volume
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}&price_change_percentage=24h,7d,30d`,
      { next: { revalidate: 120 } }
    ),
    // 2. 30 days of OHLC candles for RSI and MACD
    fetch(`https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=30`, {
      next: { revalidate: 300 },
    }),
  ])

  try {
    if (spotResult.status === "fulfilled" && spotResult.value.ok) {
      const [spot] = await spotResult.value.json()
      if (spot) {
        response.currentPrice = spot.current_price ?? null
        response.priceChange24h =
          spot.price_change_percentage_24h_in_currency ?? spot.price_change_percentage_24h ?? null
        response.priceChange7d = spot.price_change_percentage_7d_in_currency ?? null
        response.priceChange30d = spot.price_change_percentage_30d_in_currency ?? null
        response.marketCap = spot.market_cap ?? null
        response.volume24h = spot.total_volume ?? null
      }
    } else {
      console.error("[market-data] CoinGecko markets fetch failed:", spotResult.status === "fulfilled" ? spotResult.value.status : spotResult.reason)
    }
  } catch (err) {
    console.error("[market-data] CoinGecko markets parse error:", err)
  }

  try {
    if (ohlcResult.status === "fulfilled" && ohlcResult.value.ok) {
      const ohlcData = await ohlcResult.value.json()

      // OHLC data format: [timestamp, open, high, low, close]
      const closingPrices: number[] = Array.isArray(ohlcData) ? ohlcData.map((candle: number[]) => candle[4]) : []

      if (closingPrices.length >= 26) {
        const rsi = calculateRSI(closingPrices, 14)
        if (rsi !== null) {
          response.rsi = Math.round(rsi * 10) / 10
          response.rsiLabel = getRSILabel(rsi)
        }

        const macdResult = calculateMACD(closingPrices)
        if (macdResult !== null) {
          response.macd = macdResult.direction
          response.macdValue = Math.round(macdResult.value * 100) / 100
        }
      }
    } else {
      console.error("[market-data] CoinGecko OHLC fetch failed:", ohlcResult.status === "fulfilled" ? ohlcResult.value.status : ohlcResult.reason)
    }
  } catch (err) {
    console.error("[market-data] CoinGecko OHLC parse error:", err)
  }

  // CoinGecko's free API rate-limits shared server IPs. When a call comes back empty,
  // the CDN keeps that reply for 15 s instead of minutes, so the next poll tries again.
  const complete = response.currentPrice !== null && response.rsi !== null
  return NextResponse.json(response, {
    headers: {
      "Cache-Control": complete ? "public, s-maxage=120, stale-while-revalidate=300" : "public, s-maxage=15",
    },
  })
}
