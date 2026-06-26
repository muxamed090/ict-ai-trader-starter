// supabase/functions/ict-rules/index.ts
// Deno runtime — runs on Supabase Edge

import { serve }         from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient }  from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { pair, rules, entry, sl, tp1, tp2, session } = await req.json()

    // ── 1. Score the 7 ICT rules ─────────────────────────────
    const ruleKeys  = ['bos','choch','ob','fvg','liquidity','ote','htf']
    const score     = ruleKeys.filter(k => rules[k]).length
    const confluences = ruleKeys.filter(k => rules[k]).map((k: string) => k.toUpperCase())

    // ── 2. Confidence = (score/7) × 100 ──────────────────────
    const confidence = Math.round((score / 7) * 100)

    // ── 3. Premium gate: only 7/7 ────────────────────────────
    if (score < 7) {
      return new Response(JSON.stringify({
        signal: null,
        reason: `Score ${score}/7 — min 7/7 required`,
        score,
        confidence,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── 4. Retrieve settings & check daily limit ──────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('signals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`)

    const { data: settings } = await supabase
      .from('app_settings')
      .select('max_signals_per_day, trading_mode')
      .single()

    const maxSignals = settings?.max_signals_per_day ?? 3

    if ((count ?? 0) >= maxSignals) {
      return new Response(JSON.stringify({
        signal: null,
        reason: `Daily limit reached (${count}/${maxSignals})`,
        score,
        confidence,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── 5. Build and save signal ──────────────────────────────
    const signal = {
      pair, entry, sl, tp1, tp2, session, confluences,
      direction:       entry > sl ? 'BUY' : 'SELL',
      score,
      confidence,
      win_probability: 0,   // filled by ml-prediction function
      status:          'pending',
    }

    const { data: saved, error } = await supabase
      .from('signals')
      .insert(signal)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ signal: saved, score, confidence }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
