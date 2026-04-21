'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

type Video = { jour: string; titre: string; hook: string }
type Semaine = { num: number; titre: string; videos: Video[] }
type Plan = {
  niche: string
  angle: string
  description: string
  semaines: Semaine[]
  conseil: string
}

function PlanContent() {
  const params = useSearchParams()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const answers = {
      univers: params.get('univers'),
      objectif: params.get('objectif'),
      experience: params.get('experience'),
      frein: params.get('frein'),
      frequence: params.get('frequence'),
    }
    fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Erreur API')
        return data
      })
      .then(data => { setPlan(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Génération de ton plan personnalisé...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-red-400 text-sm font-mono bg-zinc-900 p-4 rounded-xl">{error}</p>
      </div>
    </div>
  )

  if (!plan) return null

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-10">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Ta niche</span>
          <div className="mt-2 inline-block bg-zinc-900 border border-zinc-700 px-4 py-1 rounded-full text-sm font-medium">{plan.niche}</div>
          <h1 className="text-2xl font-bold mt-4 mb-2">{plan.angle}</h1>
          <p className="text-zinc-400 leading-relaxed">{plan.description}</p>
        </div>

        <div className="mb-10">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Plan 4 semaines</span>
          {(plan.semaines || []).map(s => (
            <div key={s.num} className="mt-6">
              <p className="text-sm font-medium text-zinc-400 mb-3">Semaine {s.num} — {s.titre}</p>
              <div className="flex flex-col gap-2">
                {(s.videos || []).map((v, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-1">{v.jour}</p>
                    <p className="font-medium mb-1">{v.titre}</p>
                    <p className="text-sm text-zinc-400">Hook : "{v.hook}"</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Ton anti-blocage</span>
          <p className="mt-3 text-zinc-300 leading-relaxed">{plan.conseil}</p>
        </div>
      </div>
    </main>
  )
}

export default function PlanPage() {
  return <Suspense><PlanContent /></Suspense>
}