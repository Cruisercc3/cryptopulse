"use client"

import { useEffect, useState } from "react"
import { formatProbability, formatUsd, type Market } from "@/lib/signals"

export interface Brief {
  text: string
  /** "model" only when the text came back from the AI route. */
  source: "model" | "template"
}

type BriefState = "idle" | "loading" | "done"

// Model briefs are kept until the page reloads, so scrolling back never re-asks.
const briefCache = new Map<string, Brief>()
// Template fallbacks are kept too, but a card may ask the model again after this long.
const templateCache = new Map<string, { brief: Brief; at: number }>()
const TEMPLATE_RETRY_MS = 60_000
// Resolves to null when the request was dropped before it started.
const inFlight = new Map<string, Promise<Brief | null>>()

// Groq's free tier allows a few thousand tokens a minute for the whole site,
// so one browser sends at most two briefs at a time.
const MAX_CONCURRENT = 2
let active = 0
// How many cards on screen are waiting for each market's brief right now.
const watchers = new Map<string, number>()
interface Job {
  id: string
  run: () => void
  drop: () => void
}
const waiting: Job[] = []

// A brief still in the queue when its card leaves the screen is dropped, so a fast
// scroll doesn't leave a line of model calls for cards nobody is looking at.
function startNext() {
  while (active < MAX_CONCURRENT && waiting.length > 0) {
    const job = waiting.shift()!
    if ((watchers.get(job.id) ?? 0) > 0) job.run()
    else job.drop()
  }
}

function schedule(id: string, task: () => Promise<Brief>): Promise<Brief | null> {
  return new Promise<Brief | null>((resolve) => {
    const run = () => {
      active += 1
      task()
        .then(resolve, () => resolve(null))
        .finally(() => {
          active -= 1
          startNext()
        })
    }
    waiting.push({ id, run, drop: () => resolve(null) })
    startNext()
  })
}

function watch(id: string, delta: 1 | -1) {
  const n = (watchers.get(id) ?? 0) + delta
  if (n > 0) watchers.set(id, n)
  else watchers.delete(id)
}

const STANCE: Record<Market["signal"], string> = {
  bullish: "The rule reads this as momentum. Watch whether volume holds as it climbs.",
  bearish: "The rule reads this as selling pressure. Watch for a bounce or a second leg down.",
  contrarian: "The move runs against the crowd's consensus. Watch for a catalyst that confirms or reverses it.",
  neutral: "No clear direction yet. A 2pp move on real volume would change that.",
}

/** Plain sentence built from the numbers, shown when the model can't answer. */
export function templateBrief(m: Market): string {
  const dir =
    m.change24h > 0
      ? `up ${m.change24h.toFixed(1)}pp`
      : m.change24h < 0
        ? `down ${Math.abs(m.change24h).toFixed(1)}pp`
        : "flat"
  return `${m.question} sits at ${formatProbability(m.probability)}, ${dir} over 24h on ${formatUsd(m.volume24h)} of volume. ${STANCE[m.signal]}`
}

async function requestBrief(m: Market): Promise<Brief> {
  try {
    const res = await fetch("/api/signals/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: m.id,
        question: m.question,
        probability: m.probability,
        change24h: m.change24h,
        change7d: m.change7d,
        volume24h: m.volume24h,
        signalType: m.signal,
      }),
    })
    if (!res.ok) throw new Error(`AI route answered ${res.status}`)
    const data = await res.json()
    const text = typeof data?.analysis === "string" ? data.analysis.trim() : ""
    if (!text || data?.source !== "model") throw new Error("No model text")
    return { text, source: "model" }
  } catch {
    return { text: templateBrief(m), source: "template" }
  }
}

/**
 * Asks the AI route for a brief while `enabled` is true.
 * With `dwellMs`, the card has to stay enabled (in view) that long first,
 * so scrolling quickly past a card doesn't spend a model call on it.
 */
export function useBrief(market: Market | null, enabled: boolean, dwellMs = 0) {
  const id = market?.id ?? null
  const cachedNow = () => (id ? briefCache.get(id) ?? templateCache.get(id)?.brief ?? null : null)
  const [brief, setBrief] = useState<Brief | null>(cachedNow)
  const [state, setState] = useState<BriefState>(() => (cachedNow() ? "done" : "idle"))

  useEffect(() => {
    if (!market || !id) return
    const modelBrief = briefCache.get(id)
    if (modelBrief) {
      setBrief(modelBrief)
      setState("done")
      return
    }
    const template = templateCache.get(id)
    if (template) {
      setBrief(template.brief)
      setState("done")
    } else {
      setBrief(null)
      setState("idle")
    }
    if (!enabled) return
    if (template && Date.now() - template.at < TEMPLATE_RETRY_MS) return

    let cancelled = false
    let watching = false
    const timer = setTimeout(() => {
      if (cancelled) return
      if (!template) setState("loading")
      watch(id, 1)
      watching = true
      let pending = inFlight.get(id)
      if (!pending) {
        pending = schedule(id, () => requestBrief(market)).then((b) => {
          inFlight.delete(id)
          // Dropped before it started. The card asks again if it comes back on screen.
          if (!b) return null
          if (b.source === "model") {
            briefCache.set(id, b)
            templateCache.delete(id)
          } else {
            templateCache.set(id, { brief: b, at: Date.now() })
          }
          return b
        })
        inFlight.set(id, pending)
      }
      pending.then((b) => {
        if (cancelled || !b) return
        setBrief(b)
        setState("done")
      })
    }, dwellMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (watching) watch(id, -1)
    }
    // The market object changes on every poll. The brief is per market id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, enabled, dwellMs])

  return { brief, state }
}
