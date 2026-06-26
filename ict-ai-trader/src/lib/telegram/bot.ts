import type { Signal } from '@/types'
import { calcRR, pips } from '@/lib/ict/rules'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const API_BASE  = `https://api.telegram.org/bot${BOT_TOKEN}`

// ── Format signal into Telegram message ──────────────────────
export function formatSignalMessage(signal: Signal): string {
  const isJPY = signal.pair.includes('JPY')
  const rr    = calcRR(signal.entry, signal.sl, signal.tp1)
  const slPips = pips(signal.entry, signal.sl, isJPY)
  const tp1Pips = pips(signal.entry, signal.tp1, isJPY)
  const emoji  = signal.direction === 'BUY' ? '🟢' : '🔴'
  const arrow  = signal.direction === 'BUY' ? '⬆️' : '⬇️'

  const confluenceIcons: Record<string, string> = {
    BOS: '📊', CHOCH: '🔄', OB: '📦', FVG: '🎯',
    LIQUIDITY: '💧', OTE: '🌀', HTF: '🏔️', KILLZONE: '⏰',
  }

  const confStr = signal.confluences
    .map(c => `${confluenceIcons[c] ?? '✅'} ${c}`)
    .join('  ')

  return `
${emoji} <b>ICT AI TRADER v2.0</b> ${arrow}

<b>${signal.direction} ${signal.pair}</b>
━━━━━━━━━━━━━━━━━━━━

📍 Entry:  <code>${signal.entry}</code>
🛑 SL:     <code>${signal.sl}</code> (${slPips} pips)
🎯 TP1:    <code>${signal.tp1}</code> (${tp1Pips} pips)
🎯 TP2:    <code>${signal.tp2}</code>

📈 RR:         1:${rr}
🤖 Score:      ${signal.score}/7
💡 Confidence: ${signal.confidence}%
🧠 Win Prob:   ${signal.win_probability}%
🕐 Session:    ${signal.session}

<b>Confluences:</b>
${confStr}

⚡ <i>HIGH PROBABILITY SETUP</i>
`.trim()
}

// ── Send message to a channel ─────────────────────────────────
export async function sendSignal(
  channelId: string,
  signal: Signal
): Promise<boolean> {
  const text = formatSignalMessage(signal)

  const res = await fetch(`${API_BASE}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    channelId,
      text,
      parse_mode: 'HTML',
    }),
  })

  return res.ok
}

// ── Send plain text alert ─────────────────────────────────────
export async function sendAlert(
  channelId: string,
  message: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id:    channelId,
      text:       message,
      parse_mode: 'HTML',
    }),
  })

  return res.ok
}
