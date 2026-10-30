"use client"

import { useState, useEffect, useCallback } from "react"

export interface CMCCoin {
  id: number
  name: string
  symbol: string
  slug: string
  rank: number
  price: number
  volume24h: number
  volumeChange24h: number
  percentChange1h: number
  percentChange24h: number
  percentChange7d: number
  percentChange30d: number
  marketCap: number
  marketCapDominance: number
  fullyDilutedMarketCap: number
  circulatingSupply: number
  totalSupply: number
  maxSupply: number | null
  lastUpdated: string
  tags: string[]
}

export interface CMCGlobalMetrics {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  activeCoins: number
  activeExchanges: number
  totalMarketCapChange24h: number
  totalVolume24hChange: number
  altcoinMarketCap: number
  altcoinVolume24h: number
  defiMarketCap: number
  defiVolume24h: number
  stablecoinMarketCap: number
  stablecoinVolume24h: number
  lastUpdated: string
  timestamp: string
}

interface UseCMCOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  limit?: number
}

/**
 * Hook to fetch live cryptocurrency data from CoinMarketCap
 */
export function useCoinMarketCap(options: UseCMCOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    limit = 100,
  } = options

  const [coins, setCoins] = useState<CMCCoin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")

  const fetchCoins = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/coinmarketcap?limit=${limit}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setCoins(data.data)
      setLastUpdated(data.timestamp)
      setConnectionStatus("connected")
      return data.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch CMC data")
      setError(error)
      setConnectionStatus("disconnected")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchCoins()

    if (autoRefresh) {
      const interval = setInterval(fetchCoins, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchCoins, autoRefresh, refreshInterval])

  return {
    coins,
    isLoading,
    error,
    lastUpdated,
    connectionStatus,
    refetch: fetchCoins,
  }
}

/**
 * Hook to fetch specific cryptocurrency quotes
 */
export function useCMCQuotes(symbols: string[] = ["BTC", "ETH", "SOL", "XRP", "DOGE", "BNB"]) {
  const [coins, setCoins] = useState<CMCCoin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")

  // Callers pass a new array on every render. Depending on the joined string
  // keeps fetchQuotes stable, so the effect below runs once, not on every render.
  const symbolsKey = symbols.join(",")

  const fetchQuotes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/coinmarketcap/quotes?symbols=${symbolsKey}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setCoins(data.data)
      setConnectionStatus("connected")
      return data.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch quotes")
      setError(error)
      setConnectionStatus("disconnected")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [symbolsKey])

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 30000)
    return () => clearInterval(interval)
  }, [fetchQuotes])

  return {
    coins,
    isLoading,
    error,
    connectionStatus,
    refetch: fetchQuotes,
  }
}

/**
 * Hook to fetch global market metrics
 */
export function useCMCGlobal() {
  const [metrics, setMetrics] = useState<CMCGlobalMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGlobal = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/coinmarketcap/global", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setMetrics(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch global metrics")
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGlobal()
    const interval = setInterval(fetchGlobal, 60000)
    return () => clearInterval(interval)
  }, [fetchGlobal])

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchGlobal,
  }
}

/**
 * Utility to format price
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  if (price >= 1) {
    return `$${price.toFixed(2)}`
  }
  if (price >= 0.01) {
    return `$${price.toFixed(4)}`
  }
  return `$${price.toFixed(8)}`
}

/**
 * Utility to format market cap / volume
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return `$${(num / 1_000_000_000_000).toFixed(2)}T`
  }
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}

/**
 * Derive signal from price changes
 */
export function deriveCMCSignal(
  percentChange24h: number,
  percentChange7d: number
): "bullish" | "bearish" | "neutral" | "contrarian" {
  // Strong bullish: positive 24h and 7d with 24h > 5%
  if (percentChange24h > 5 && percentChange7d > 0) return "bullish"
  
  // Strong bearish: negative 24h and 7d with 24h < -5%
  if (percentChange24h < -5 && percentChange7d < 0) return "bearish"
  
  // Contrarian: 24h strongly opposite to 7d trend
  if (percentChange24h > 5 && percentChange7d < -10) return "contrarian"
  if (percentChange24h < -5 && percentChange7d > 10) return "contrarian"
  
  // Moderately bullish/bearish
  if (percentChange24h > 2) return "bullish"
  if (percentChange24h < -2) return "bearish"
  
  return "neutral"
}
