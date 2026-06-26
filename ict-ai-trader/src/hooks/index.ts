import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Signal, TradeJournalEntry, DashboardStats, AppSettings } from '@/types'

// ── useSignals — realtime signal feed ────────────────────────
export function useSignals() {
  const [signals, setSignals]   = useState<Signal[]>([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setSignals(data ?? [])
        setLoading(false)
      })

    // Realtime subscription
    const channel = supabase
      .channel('signals-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'signals' },
        payload => setSignals(prev => [payload.new as Signal, ...prev])
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { signals, loading, error }
}

// ── useJournal — trade history ────────────────────────────────
export function useJournal() {
  const [entries,  setEntries]  = useState<TradeJournalEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('trade_journal')
      .select('*')
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const addEntry = async (entry: Omit<TradeJournalEntry, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('trade_journal').insert(entry)
    if (!error) refresh()
    return !error
  }

  return { entries, loading, refresh, addEntry }
}

// ── useDashboardStats ─────────────────────────────────────────
export function useDashboardStats() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.functions.invoke('dashboard-stats')
      .then(({ data }) => {
        setStats(data)
        setLoading(false)
      })
  }, [])

  return { stats, loading }
}

// ── useSettings ───────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('*')
      .single()
      .then(({ data }) => setSettings(data))
  }, [])

  const updateSettings = async (patch: Partial<AppSettings>) => {
    const { error } = await supabase
      .from('app_settings')
      .update(patch)
      .eq('id', 1)
    if (!error) setSettings(prev => prev ? { ...prev, ...patch } : null)
    return !error
  }

  return { settings, updateSettings }
}
