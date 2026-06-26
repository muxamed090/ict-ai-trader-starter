import type { ICTRules, Signal, SignalDirection, TradeSession } from '@/types'

// ── Pair list ────────────────────────────────────────────────
export const WATCHLIST = [
  'EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY',
  'EURJPY', 'GBPJPY', 'AUDUSD', 'USDCAD',
  'NZDUSD', 'USDCHF',
]

// ── Session windows (UTC hours) ───────────────────────────────
export const SESSIONS: Record<TradeSession, [number, number]> = {
  London:     [7,  12],
  'New York': [13, 18],
  Asia:       [0,   6],
}

export function getCurrentSession(): TradeSession | null {
  const hour = new Date().getUTCHours()
  for (const [name, [start, end]] of Object.entries(SESSIONS)) {
    if (hour >= start && hour < end) return name as TradeSession
  }
  return null
}

// ── Score ICT rules (7 = all confirmed) ──────────────────────
export function scoreICTRules(rules: ICTRules): number {
  return Object.values(rules).filter(Boolean).length
}

// ── Premium filter: only 7/7 ─────────────────────────────────
export function isPremiumSetup(score: number): boolean {
  return score === 7
}

// ── Build a signal object from raw rule data ─────────────────
export function buildSignal(params: {
  pair: string
  direction: SignalDirection
  rules: ICTRules
  entry: number
  sl: number
  tp1: number
  tp2: number
  session: TradeSession
  confidence: number
  win_probability: number
}): Omit<Signal, 'id' | 'created_at'> {
  const confluences = Object.entries(params.rules)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase())

  return {
    pair:            params.pair,
    direction:       params.direction,
    score:           scoreICTRules(params.rules) as Signal['score'],
    confidence:      params.confidence,
    entry:           params.entry,
    sl:              params.sl,
    tp1:             params.tp1,
    tp2:             params.tp2,
    session:         params.session,
    confluences,
    win_probability: params.win_probability,
    status:          'pending',
  }
}

// ── Risk:Reward helper ────────────────────────────────────────
export function calcRR(entry: number, sl: number, tp: number): number {
  const risk   = Math.abs(entry - sl)
  const reward = Math.abs(tp - entry)
  return risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0
}

// ── Pip distance helper ───────────────────────────────────────
export function pips(a: number, b: number, isJPY = false): number {
  const mult = isJPY ? 100 : 10000
  return Math.round(Math.abs(a - b) * mult)
}
