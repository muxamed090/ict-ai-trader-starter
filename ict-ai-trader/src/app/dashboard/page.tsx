import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth-login')

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ICT AI Trader</h1>
            <p className="text-gray-400 text-sm mt-0.5">v2.0 — Nidaamka Ganacsiga Mustaqbalka</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Stats row — waxaa ku bedelay real data marka hooks diyaar yihiin */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Win Rate',       value: '—',  unit: '%'   },
            { label: 'Total Profit',   value: '—',  unit: '$'   },
            { label: 'Signals Today',  value: '—',  unit: '/3'  },
            { label: 'Avg R:R',        value: '—',  unit: ''    },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}<span className="text-base text-gray-500">{s.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Signals feed placeholder */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Signals — Maanta</h2>
          <p className="text-gray-500 text-sm">Signal cusub marka nidaamku soo diraa ayaa halkan ka muuqan doona.</p>
        </div>

        {/* Mode indicator */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Trading Mode</p>
            <p className="font-medium mt-0.5">Rules Only</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">AI Learning</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">OFF</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Min Score</p>
            <p className="font-medium mt-0.5">7/7</p>
          </div>
          <a href="/settings" className="text-xs text-blue-400 hover:underline">Settings →</a>
        </div>

      </div>
    </main>
  )
}
