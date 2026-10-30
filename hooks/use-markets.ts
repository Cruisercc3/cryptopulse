"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { toMarket, type Market, type RawMarket } from "@/lib/signals"

const MARKETS_KEY = "/api/polymarket/markets?limit=150"

const jsonFetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

/**
 * The live Polymarket crypto markets, shared by every component on the page.
 * SWR dedupes the key, so the home page's hero, feed and cards make one request.
 */
export function useMarkets() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<RawMarket[]>(
    MARKETS_KEY,
    jsonFetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
      keepPreviousData: true,
    },
  )

  const markets = useMemo<Market[]>(() => {
    if (!Array.isArray(data)) return []
    return data.map(toMarket).filter((m): m is Market => m !== null)
  }, [data])

  // The route answers [] when Polymarket fails, so an empty list after loading is an error too.
  const failed = Boolean(error) || (!isLoading && Array.isArray(data) && markets.length === 0)

  return {
    markets,
    isLoading: isLoading && markets.length === 0,
    isValidating,
    error: failed ? (error instanceof Error ? error.message : "Polymarket returned no markets") : null,
    refresh: () => mutate(),
  }
}

export type HistoryRange = "1d" | "1w" | "1m" | "max"

export interface HistoryPoint {
  t: number
  p: number
}

/** Yes-price history for one market from Polymarket's CLOB, via our cached route. */
export function usePriceHistory(tokenId: string | null, range: HistoryRange, enabled = true) {
  const key = enabled && tokenId ? `/api/polymarket/history?token=${tokenId}&range=${range}` : null
  const { data, error, isLoading } = useSWR<{ points: HistoryPoint[] }>(key, jsonFetcher, {
    revalidateOnFocus: false,
    refreshInterval: 300_000,
    dedupingInterval: 60_000,
    keepPreviousData: true,
  })
  return {
    points: data?.points ?? [],
    isLoading: Boolean(key) && isLoading,
    error: error ? "History unavailable" : null,
  }
}

/**
 * `inView` flips to true once the element scrolls near the viewport, then stays true.
 * `visible` follows the element in and out, for work that should only start while it's on screen.
 */
export function useInView<T extends Element>(rootMargin = "200px") {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
        if (entry.isIntersecting) setInView(true)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView, visible }
}
