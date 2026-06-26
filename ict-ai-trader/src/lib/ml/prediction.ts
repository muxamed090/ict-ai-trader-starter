import type { MLPrediction, TradingMode } from '@/types'

// ── Weight table — updated by AI Learning Engine ──────────────
// Each key = ICT rule, value = learned importance (0–1)
const DEFAULT_WEIGHTS: Record<string, number> = {
  bos:       0.20,
  choch:     0.18,
  ob:        0.17,
  fvg:       0.15,
  liquidity: 0.12,
  ote:       0.10,
  htf:       0.08,
}

// ── Compute win probability from ICT rule booleans ───────────
export function computeWinProbability(
  rules: Record<string, boolean>,
  weights: Record<string, number> = DEFAULT_WEIGHTS,
  newsImpact: 'clear' | 'near' | 'active' = 'clear'
): number {
  let score = 0
  let total = 0

  for (const [key, weight] of Object.entries(weights)) {
    if (rules[key]) score += weight
    total += weight
  }

  let probability = total > 0 ? (score / total) * 100 : 0

  // News penalty
  if (newsImpact === 'near')   probability *= 0.85
  if (newsImpact === 'active') probability *= 0.60

  return Math.round(Math.min(probability, 99))
}

// ── Map probability → recommendation based on mode ───────────
export function getRecommendation(
  probability: number,
  mode: TradingMode
): MLPrediction['recommendation'] {
  if (mode === 'rules_only') return 'ENTER'  // ML ignored

  const threshold = mode === 'ml_priority' ? 85 : 80
  if (probability >= threshold) return 'ENTER'
  if (probability >= 70)        return 'WAIT'
  return 'SKIP'
}

// ── Full prediction object ────────────────────────────────────
export function buildPrediction(params: {
  pair: string
  rules: Record<string, boolean>
  weights?: Record<string, number>
  newsImpact?: 'clear' | 'near' | 'active'
  mode: TradingMode
}): MLPrediction {
  const weights     = params.weights ?? DEFAULT_WEIGHTS
  const newsImpact  = params.newsImpact ?? 'clear'
  const probability = computeWinProbability(params.rules, weights, newsImpact)

  const factors: Record<string, number> = {}
  for (const [key, weight] of Object.entries(weights)) {
    factors[key] = params.rules[key] ? weight : 0
  }

  return {
    pair:            params.pair,
    win_probability: probability,
    confidence:      Math.round(probability * 0.95),
    factors,
    recommendation:  getRecommendation(probability, params.mode),
  }
}

// ── Update weights after trade closes (AI Learning) ──────────
export function updateWeights(
  weights: Record<string, number>,
  rules: Record<string, boolean>,
  result: 'WIN' | 'LOSS',
  learningRate = 0.01
): Record<string, number> {
  const updated = { ...weights }
  const delta   = result === 'WIN' ? learningRate : -learningRate

  for (const key of Object.keys(updated)) {
    if (rules[key]) {
      updated[key] = Math.max(0.01, Math.min(0.5, updated[key] + delta))
    }
  }

  // Re-normalise so weights sum to 1
  const sum = Object.values(updated).reduce((a, b) => a + b, 0)
  for (const key of Object.keys(updated)) {
    updated[key] = updated[key] / sum
  }

  return updated
}
