// supabase/functions/signal-dispatcher/index.ts

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendTelegram(token: string, channelId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: 'HTML' }),
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { signal_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch signal
    const { data: signal, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', signal_id)
      .single()

    if (error || !signal) throw new Error('Signal not found')

    // Fetch settings
    const { data: settings } = await supabase
      .from('app_settings')
      .select('telegram_enabled, telegram_channel_id')
      .single()

    // Format message
    const emoji   = signal.direction === 'BUY' ? '🟢' : '🔴'
    const isJPY   = signal.pair.includes('JPY')
    const mult    = isJPY ? 100 : 10000
    const slPips  = Math.round(Math.abs(signal.entry - signal.sl) * mult)
    const tp1Pips = Math.round(Math.abs(signal.entry - signal.tp1) * mult)
    const rr      = (tp1Pips / slPips).toFixed(1)
    const confStr = (signal.confluences as string[]).map(c => `✅ ${c}`).join('  ')

    const msg = `
${emoji} <b>ICT AI TRADER v2.0</b>

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

⚡ <i>HIGH PROBABILITY SETUP</i>`.trim()

    // Send Telegram
    if (settings?.telegram_enabled && settings?.telegram_channel_id) {
      const token = Deno.env.get('TELEGRAM_BOT_TOKEN')!
      await sendTelegram(token, settings.telegram_channel_id, msg)
    }

    // Update signal status to active
    await supabase
      .from('signals')
      .update({ status: 'active' })
      .eq('id', signal_id)

    return new Response(
      JSON.stringify({ success: true, signal_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
