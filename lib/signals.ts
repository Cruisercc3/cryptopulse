/**
 * One place for how a Polymarket market becomes a signal.
 *
 * Every page (Signals, Predictions, Trending, Charts, the home feed) reads
 * markets through toMarket() so they all use the same rule and the same
 * confidence maths.
 */

export type SignalType = "bullish" | "bearish" | "contrarian" | "neutral"

export type Asset = "BTC" | "ETH" | "SOL" | "XRP" | "DOGE" | "BNB" | "DeFi" | "ETF" | "Other"

/** The slim market shape /api/polymarket/markets returns. */
export interface RawMarket {
  id: string
  question: string
  slug?: string
  eventSlug?: string
  eventTitle?: string
  outcomePrices?: string
  outcomes?: string
  clobTokenIds?: string
  volumeNum?: number
  volume24hr?: number
  volume1wk?: number
  volume1mo?: number
  liquidityNum?: number
  oneDayPriceChange?: number
  oneWeekPriceChange?: number
  oneMonthPriceChange?: number
  endDate?: string
}

export interface Market {
  id: string
  question: string
  eventTitle: string | null
  /** Yes price as a percentage, one decimal. */
  probability: number
  /** Changes in percentage points. */
  change24h: number
  change7d: number
  change30d: number
  volume24h: number
  volume7d: number
  volume30d: number
  volumeTotal: number
  liquidity: number
  endDate: string | null
  /** CLOB token id of the Yes outcome, used for price history. */
  yesTokenId: string | null
  url: string
  asset: Asset
  signal: SignalType
  confidence: number
}

/**
 * The signal rule, in percentage points over 24h. "Before" is the price 24h ago.
 * - contrarian: a long shot (35% or less before) jumps 5pp or more,
 *   or a favourite (65% or more before) drops 5pp or more
 * - bullish: up 2pp or more
 * - bearish: down 2pp or more
 * - neutral: anything smaller
 */
export const SIGNAL_RULE = {
  move: 2,
  contrarianMove: 5,
  longShot: 35,
  favourite: 65,
} as const

export function classifySignal(probability: number, change24h: number): SignalType {
  const { move, contrarianMove, longShot, favourite } = SIGNAL_RULE
  const before = probability - change24h
  if (before <= longShot && change24h >= contrarianMove) return "contrarian"
  if (before >= favourite && change24h <= -contrarianMove) return "contrarian"
  if (change24h >= move) return "bullish"
  if (change24h <= -move) return "bearish"
  return "neutral"
}

/**
 * How much the numbers back the label, 0 to 100.
 * 70% comes from the size of the 24h move (10pp or more counts in full),
 * 30% from 24h volume on a log scale ($1M or more counts in full).
 * A market sitting still at 0% with no trades scores 0.
 */
export function signalConfidence(change24h: number, volume24h: number): number {
  const move = Math.min(1, Math.abs(change24h) / 10)
  const volume = volume24h > 1 ? Math.min(1, Math.log10(volume24h) / 6) : 0
  return Math.round(100 * (0.7 * move + 0.3 * volume))
}

export const CONFIDENCE_HELP =
  "70% from the size of the 24h move (10pp or more counts in full), 30% from 24h volume ($1M or more counts in full)."

const ASSET_PATTERNS: Array<[Asset, RegExp]> = [
  ["BTC", /\b(bitcoin|btc)\b/i],
  ["ETH", /\b(ethereum|eth|ether)\b/i],
  ["SOL", /\b(solana|sol)\b/i],
  ["XRP", /\b(xrp|ripple)\b/i],
  ["DOGE", /\b(doge|dogecoin)\b/i],
  ["BNB", /\b(bnb|binance coin)\b/i],
  ["DeFi", /\b(defi|uniswap|aave|compound|tvl)\b/i],
  ["ETF", /\betfs?\b/i],
]

export function detectAsset(question: string): Asset {
  for (const [asset, pattern] of ASSET_PATTERNS) {
    if (pattern.test(question)) return asset
  }
  return "Other"
}

/** CoinGecko ids for the coins the market-data route knows. */
export const ASSET_COIN_ID: Partial<Record<Asset, string>> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  BNB: "binancecoin",
}

/** TradingView symbols for the same coins. */
export const ASSET_TV_SYMBOL: Partial<Record<Asset, string>> = {
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  XRP: "BINANCE:XRPUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  BNB: "BINANCE:BNBUSDT",
}

function parseJsonArray(value?: string): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function polymarketUrl(m: Pick<RawMarket, "eventSlug" | "slug">): string {
  if (m.eventSlug) return `https://polymarket.com/event/${m.eventSlug}`
  if (m.slug) return `https://polymarket.com/event/${m.slug}`
  return "https://polymarket.com"
}

const round1 = (n: number) => Math.round(n * 10) / 10

export function toMarket(raw: RawMarket): Market | null {
  if (!raw?.id || !raw.question) return null
  const prices = parseJsonArray(raw.outcomePrices)
  if (prices.length === 0) return null
  const yes = parseFloat(prices[0])
  if (!Number.isFinite(yes)) return null

  const probability = round1(yes * 100)
  const change24h = round1((raw.oneDayPriceChange ?? 0) * 100)
  const volume24h = raw.volume24hr ?? 0
  const signal = classifySignal(probability, change24h)

  return {
    id: String(raw.id),
    question: raw.question,
    eventTitle: raw.eventTitle ?? null,
    probability,
    change24h,
    change7d: round1((raw.oneWeekPriceChange ?? 0) * 100),
    change30d: round1((raw.oneMonthPriceChange ?? 0) * 100),
    volume24h,
    volume7d: raw.volume1wk ?? 0,
    volume30d: raw.volume1mo ?? 0,
    volumeTotal: raw.volumeNum ?? 0,
    liquidity: raw.liquidityNum ?? 0,
    endDate: raw.endDate ?? null,
    yesTokenId: parseJsonArray(raw.clobTokenIds)[0] ?? null,
    url: polymarketUrl(raw),
    asset: detectAsset(raw.question),
    signal,
    confidence: signalConfidence(change24h, volume24h),
  }
}

export function formatUsd(value: number): string {
  if (!value || value <= 0) return "$0"
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function formatProbability(p: number): string {
  if (p > 0 && p < 1) return "<1%"
  if (p < 100 && p > 99) return ">99%"
  return `${Math.round(p)}%`
}

export function formatChange(pp: number): string {
  const sign = pp > 0 ? "+" : ""
  return `${sign}${pp.toFixed(1)}pp`
}

export function daysUntil(endDate: string | null, now = Date.now()): number | null {
  if (!endDate) return null
  const t = new Date(endDate).getTime()
  if (!Number.isFinite(t)) return null
  return Math.ceil((t - now) / 86_400_000)
}

export function formatDate(endDate: string | null): string {
  if (!endDate) return "No date"
  const d = new Date(endDate)
  if (!Number.isFinite(d.getTime())) return "No date"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ── Predictions page filters ───────────────────────────────────────────────

const CATEGORY_PATTERNS: Array<[string, RegExp]> = [
  ["Regulation", /\b(sec|regulat\w*|law|legal|government|congress|senate|bill|cftc|gensler|atkins)\b/i],
  ["DeFi", /\b(defi|tvl|uniswap|aave|lending|stablecoins?|usdt|usdc|tether)\b/i],
  ["Market Cap", /\b(market cap|dominance|flip(pen|s)?|trillion)\b/i],
  ["Bitcoin", /\b(bitcoin|btc|halving|microstrategy|mstr|saylor)\b/i],
  ["Ethereum", /\b(ethereum|eth|ether|staking)\b/i],
  ["Solana", /\b(solana|sol)\b/i],
  ["Altcoins", /\b(altcoins?|xrp|ripple|doge|dogecoin|bnb|cardano|ada|avax|avalanche|link|chainlink|hype|hyperliquid|pepe|shib|memecoins?)\b/i],
  ["Price Targets", /\$\s?\d/],
]

export const CATEGORIES = ["Bitcoin", "Ethereum", "Solana", "DeFi", "Altcoins", "Market Cap", "Price Targets", "Regulation", "Other"]

export function marketCategory(question: string): string {
  for (const [category, pattern] of CATEGORY_PATTERNS) {
    if (pattern.test(question)) return category
  }
  return "Other"
}

/** "Resolves within" windows, cumulative. */
export const RESOLUTION_WINDOWS = [
  { id: "1d", label: "24 Hours", days: 1 },
  { id: "7d", label: "7 Days", days: 7 },
  { id: "30d", label: "30 Days", days: 30 },
  { id: "90d", label: "90 Days", days: 90 },
  { id: "1y", label: "1 Year", days: 365 },
] as const

export function resolvesWithin(m: Pick<Market, "endDate">, windowId: string, now = Date.now()): boolean {
  const w = RESOLUTION_WINDOWS.find((x) => x.id === windowId)
  if (!w) return true
  const d = daysUntil(m.endDate, now)
  return d !== null && d >= 0 && d <= w.days
}

export function countSignals(markets: Market[]) {
  const counts = { bullish: 0, bearish: 0, contrarian: 0, neutral: 0, total: markets.length }
  for (const m of markets) counts[m.signal] += 1
  return counts
}
