// ── Signal Types ──────────────────────────────────────────────
export type SignalDirection = 'BUY' | 'SELL'
export type SignalScore = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type TradeSession = 'London' | 'New York' | 'Asia'
export type TradeResult = 'WIN' | 'LOSS' | 'OPEN' | 'CANCELLED'
export type TradingMode = 'rules_only' | 'hybrid' | 'ml_priority'

export interface Signal {
  id: string
  pair: string
  direction: SignalDirection
  score: SignalScore
  confidence: number       // 0–100
  entry: number
  sl: number
  tp1: number
  tp2: number
  session: TradeSession
  confluences: string[]    // ['BOS','OB','FVG','Liq','OTE','HTF','Killzone']
  win_probability: number  // ML output
  created_at: string
  status: 'pending' | 'active' | 'closed'
}

export interface TradeJournalEntry {
  id: string
  signal_id: string
  pair: string
  session: TradeSession
  score: SignalScore
  result: TradeResult
  pips: number
  profit: number
  rr_ratio: number
  notes?: string
  closed_at: string
  created_at: string
}

export interface PairRanking {
  pair: string
  score: SignalScore
  confidence: number
  win_probability: number
  session: TradeSession
  rank: number
}

export interface NewsEvent {
  id: string
  title: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  currency: string
  scheduled_at: string
  actual?: string
  forecast?: string
  previous?: string
}

export interface ICTRules {
  bos: boolean        // Break of Structure
  choch: boolean      // Change of Character
  ob: boolean         // Order Block
  fvg: boolean        // Fair Value Gap
  liquidity: boolean  // Liquidity Sweep
  ote: boolean        // Optimal Trade Entry
  htf: boolean        // Higher Timeframe Alignment
  killzone: boolean   // Session Killzone
}

export interface MLPrediction {
  pair: string
  win_probability: number
  confidence: number
  factors: Record<string, number>
  recommendation: 'ENTER' | 'WAIT' | 'SKIP'
}

export interface DashboardStats {
  total_trades: number
  win_rate: number
  total_profit: number
  avg_rr: number
  best_pair: string
  best_session: TradeSession
  signals_today: number
  mode: TradingMode
}

export interface AppSettings {
  trading_mode: TradingMode
  ai_learning_enabled: boolean
  max_signals_per_day: number
  min_score: SignalScore
  telegram_enabled: boolean
  telegram_channel_id: string
  pairs_watchlist: string[]
}
