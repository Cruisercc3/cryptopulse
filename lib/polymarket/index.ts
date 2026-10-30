/**
 * Polymarket Integration
 * 
 * Custom implementation for real-time prediction market data.
 * Uses native fetch() and WebSocket APIs (no external dependencies).
 * 
 * APIs:
 * - Gamma API: Market/event discovery
 * - CLOB API: Pricing, midpoints, spreads
 * - WebSocket: Real-time price streaming
 */

export * from "./api"
export * from "./websocket"
