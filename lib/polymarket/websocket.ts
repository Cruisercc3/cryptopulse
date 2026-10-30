/**
 * Polymarket Real-Time Data Socket (RTDS) Manager
 * Streams live crypto prices from Polymarket's RTDS WebSocket
 * 
 * Note: RTDS streams crypto prices (BTC, ETH, SOL, XRP), not market probabilities.
 * Market probabilities are fetched via REST API polling.
 * 
 * Uses standard browser WebSocket API (no external dependencies)
 */

export interface PriceUpdate {
  asset_id: string  // Symbol like "btcusdt", "ethusdt"
  price: number
  timestamp: number
  symbol?: string
}

export interface CryptoPriceMessage {
  topic: "crypto_prices" | "crypto_prices_chainlink"
  type: "update"
  timestamp: number
  payload: {
    symbol: string
    timestamp: number
    value: number
  }
}

export interface WebSocketMessage {
  topic?: string
  type?: string
  timestamp?: number
  payload?: {
    symbol?: string
    timestamp?: number
    value?: number
  }
  // Legacy format support
  event_type?: string
  asset_id?: string
  price?: string
  changes?: Array<{
    asset_id: string
    price: string
  }>
}

type PriceUpdateCallback = (update: PriceUpdate) => void
type ConnectionCallback = (status: "connected" | "disconnected" | "error") => void

// Polymarket RTDS WebSocket endpoint
const WS_ENDPOINT = "wss://ws-live-data.polymarket.com"

// Supported crypto symbols for Binance source
const SUPPORTED_SYMBOLS = ["btcusdt", "ethusdt", "solusdt", "xrpusdt"]

class PolymarketWebSocket {
  private ws: WebSocket | null = null
  private subscriptions: Set<string> = new Set()
  private priceCallbacks: Map<string, Set<PriceUpdateCallback>> = new Map()
  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private lastPrices: Map<string, number> = new Map()

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve()
          }
        }, 100)
        return
      }

      this.isConnecting = true

      try {
        this.ws = new WebSocket(WS_ENDPOINT)

        this.ws.onopen = () => {
          console.log("[v0] Polymarket WebSocket connected")
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.notifyConnectionStatus("connected")
          
          // Re-subscribe to any existing subscriptions
          this.subscriptions.forEach(assetId => {
            this.sendSubscribe(assetId)
          })

          // Start ping interval to keep connection alive
          this.startPingInterval()
          
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error("[v0] WebSocket error:", error)
          this.notifyConnectionStatus("error")
        }

        this.ws.onclose = () => {
          console.log("[v0] WebSocket disconnected")
          this.isConnecting = false
          this.stopPingInterval()
          this.notifyConnectionStatus("disconnected")
          this.attemptReconnect()
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * Subscribe to price updates for a specific asset/token
   */
  subscribe(assetId: string, callback: PriceUpdateCallback): () => void {
    this.subscriptions.add(assetId)
    
    if (!this.priceCallbacks.has(assetId)) {
      this.priceCallbacks.set(assetId, new Set())
    }
    this.priceCallbacks.get(assetId)!.add(callback)

    // Send subscription message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscribe(assetId)
    } else {
      // Connect if not already connected
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      this.priceCallbacks.get(assetId)?.delete(callback)
      if (this.priceCallbacks.get(assetId)?.size === 0) {
        this.subscriptions.delete(assetId)
        this.sendUnsubscribe(assetId)
      }
    }
  }

  /**
   * Subscribe to multiple assets at once
   */
  subscribeMany(assetIds: string[], callback: PriceUpdateCallback): () => void {
    const unsubscribes = assetIds.map(id => this.subscribe(id, callback))
    return () => unsubscribes.forEach(unsub => unsub())
  }

  /**
   * Add a connection status listener
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback)
    return () => this.connectionCallbacks.delete(callback)
  }

  /**
   * Get the last known price for an asset
   */
  getLastPrice(assetId: string): number | undefined {
    return this.lastPrices.get(assetId)
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopPingInterval()
    this.ws?.close()
    this.ws = null
    this.subscriptions.clear()
    this.priceCallbacks.clear()
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent auto-reconnect
  }

  private sendSubscribe(assetId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Subscribe to crypto_prices topic with specific symbol filter
      // assetId should be in format like "btcusdt", "ethusdt", "solusdt"
      const normalizedSymbol = assetId.toLowerCase()
      
      const message = JSON.stringify({
        action: "subscribe",
        subscriptions: [{
          topic: "crypto_prices",
          type: "update",
          filters: normalizedSymbol,
        }],
      })
      this.ws.send(message)
      console.log("[v0] Subscribed to crypto price:", normalizedSymbol)
    }
  }

  private sendUnsubscribe(assetId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const normalizedSymbol = assetId.toLowerCase()
      
      const message = JSON.stringify({
        action: "unsubscribe",
        subscriptions: [{
          topic: "crypto_prices",
          type: "update",
          filters: normalizedSymbol,
        }],
      })
      this.ws.send(message)
    }
  }

  /**
   * Subscribe to all supported crypto prices at once
   */
  subscribeToAllCrypto(callback: PriceUpdateCallback): () => void {
    const unsubscribes = SUPPORTED_SYMBOLS.map(symbol => this.subscribe(symbol, callback))
    return () => unsubscribes.forEach(unsub => unsub())
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data)
      
      // Handle RTDS crypto_prices format
      if (message.topic === "crypto_prices" && message.type === "update" && message.payload) {
        const { symbol, value, timestamp } = message.payload
        if (symbol && value !== undefined) {
          const normalizedSymbol = symbol.toLowerCase()
          this.lastPrices.set(normalizedSymbol, value)
          
          const update: PriceUpdate = {
            asset_id: normalizedSymbol,
            price: value,
            timestamp: timestamp || Date.now(),
            symbol: normalizedSymbol,
          }

          console.log("[v0] Received price update:", normalizedSymbol, value)

          // Notify callbacks for this symbol
          this.priceCallbacks.get(normalizedSymbol)?.forEach(cb => cb(update))
        }
      }

      // Handle legacy event_type format (if any)
      if (message.event_type === "price_change" && message.asset_id) {
        const price = parseFloat(message.price || "0")
        this.lastPrices.set(message.asset_id, price)
        
        const update: PriceUpdate = {
          asset_id: message.asset_id,
          price,
          timestamp: Date.now(),
        }

        this.priceCallbacks.get(message.asset_id)?.forEach(cb => cb(update))
      }

      // Handle bulk updates (legacy)
      if (message.changes && Array.isArray(message.changes)) {
        message.changes.forEach(change => {
          const price = parseFloat(change.price)
          this.lastPrices.set(change.asset_id, price)
          
          const update: PriceUpdate = {
            asset_id: change.asset_id,
            price,
            timestamp: Date.now(),
          }

          this.priceCallbacks.get(change.asset_id)?.forEach(cb => cb(update))
        })
      }
    } catch (error) {
      console.error("[v0] Failed to parse WebSocket message:", error)
    }
  }

  private notifyConnectionStatus(status: "connected" | "disconnected" | "error"): void {
    this.connectionCallbacks.forEach(cb => cb(status))
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[v0] Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[v0] Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // RTDS requires PING messages every 5 seconds
        this.ws.send("PING")
      }
    }, 5000) // Ping every 5 seconds as per RTDS docs
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }
}

// Singleton instance
let wsInstance: PolymarketWebSocket | null = null

export function getPolymarketWebSocket(): PolymarketWebSocket {
  if (!wsInstance) {
    wsInstance = new PolymarketWebSocket()
  }
  return wsInstance
}

// Helper hook for React components
export function createWebSocketHook() {
  const ws = getPolymarketWebSocket()
  return ws
}
