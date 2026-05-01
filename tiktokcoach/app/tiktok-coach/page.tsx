'use client'

import { useEffect, useMemo, useState } from 'react'

const STEPS = [
  {
    key: 'univers',
    label: '2 / 6',
    q: "C'est quoi ton univers ?",
    opts: [
      { e: '👟', l: 'Mode, sneakers, style', v: 'mode/sneakers/style' },
      { e: '💰', l: 'Argent, business, entrepreneuriat', v: 'business/entrepreneuriat' },
      { e: '🏋️', l: 'Sport, fitness, santé', v: 'sport/fitness' },
      { e: '🎮', l: 'Gaming, tech, culture web', v: 'gaming/tech' },
      { e: '✈️', l: 'Lifestyle, voyage, food', v: 'lifestyle/voyage' },
      { e: '😂', l: 'Humour, sketchs, quotidien', v: 'humour/sketchs' },
    ],
  },
  {
    key: 'objectif',
    label: '3 / 6',
    q: 'Ton objectif principal ?',
    opts: [
      { e: '🔥', l: 'Devenir viral vite', v: 'devenir viral rapidement' },
      { e: '💸', l: 'Monétiser, générer des revenus', v: 'monétiser et générer des revenus' },
      { e: '🌟', l: 'Construire une communauté', v: 'construire une communauté engagée' },
      { e: '🚀', l: 'Promouvoir mon business/produit', v: 'promouvoir un business ou produit' },
    ],
  },
  {
    key: 'experience',
    label: '4 / 6',
    q: 'Ton niveau sur TikTok ?',
    opts: [
      { e: '🆕', l: 'Débutant total — 0 vidéo', v: 'débutant total' },
      { e: '📱', l: 'Quelques vidéos, aucun résultat', v: 'quelques vidéos sans résultats' },
      { e: '📈', l: 'Actif mais bloqué', v: 'actif mais bloqué' },
      { e: '💪', l: "J'ai eu des vidéos virales", v: 'expérimenté avec vidéos virales' },
    ],
  },
  {
    key: 'frein',
    label: '5 / 6',
    q: 'Ton plus grand frein ?',
    opts: [
      { e: '🧠', l: 'Je ne sais pas quoi filmer', v: "manque d'idées" },
      { e: '😰', l: 'Peur du regard des autres', v: 'peur du regard des autres' },
      { e: '⏰', l: 'Je manque de temps', v: 'manque de temps' },
      { e: '📉', l: 'Mes vidéos ne décollent pas', v: 'vidéos sans engagement' },
    ],
  },
  {
    key: 'frequence',
    label: '6 / 6',
    q: 'Combien de vidéos par semaine ?',
    opts: [
      { e: '🌱', l: '1 vidéo — je teste', v: '1' },
      { e: '⚡', l: '3 vidéos — rythme sérieux', v: '3' },
      { e: '🔥', l: '5 vidéos — full grind', v: '5' },
      { e: '💥', l: '7+ — je veux exploser', v: '7' },
    ],
  },
]

const LAST_STEP = 5

type PlanItem = {
  format?: string
  idee?: string
  hook?: string
}

type GeneratePlanResult = {
  niche?: string
  angle?: string
  description?: string
  potentialScore?: number
  plan?: PlanItem[]
  conseils?: string[]
}

const FORMAT_BADGE_STYLES = [
  'border-cyan-500/40 bg-cyan-500/15 text-cyan-200',
  'border-violet-500/40 bg-violet-500/15 text-violet-200',
  'border-amber-500/40 bg-amber-500/15 text-amber-200',
  'border-emerald-500/40 bg-emerald-500/15 text-emerald-200',
  'border-pink-500/40 bg-pink-500/15 text-pink-200',
]

const CONSEIL_ICONS = ['🎯', '⚡', '📈', '💡', '🔑', '✨']

function clampPotentialScore(n: unknown): number | null {
  if (typeof n !== 'number' || Number.isNaN(n)) return null
  const x = Math.round(n)
  if (x < 60 || x > 99) return null
  return x
}

function fallbackPotentialScore(result: Pick<GeneratePlanResult, 'niche' | 'angle'>): number {
  const str = `${result.niche ?? ''}|${result.angle ?? ''}`
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return 60 + (Math.abs(h) % 40)
}

function BrandMark() {
  return (
    <div className="text-xl font-black tracking-[0.2em]">
      <span className="text-cyan-400">Tik</span>Tok<span className="text-red-500">Coach</span>
    </div>
  )
}

export default function TikTokCoach() {
  const [step, setStep] = useState(0)
  const [pseudo, setPseudo] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratePlanResult | null>(null)
  const [error, setError] = useState('')
  const [scoreBarPct, setScoreBarPct] = useState(0)

  const isPseudoStep = step === 0
  const s = isPseudoStep ? null : STEPS[step - 1]
  const sel = s ? answers[s.key] : null

  const potentialScore = useMemo(() => {
    if (!result) return 0
    return clampPotentialScore(result.potentialScore) ?? fallbackPotentialScore(result)
  }, [result])

  useEffect(() => {
    if (!result) {
      setScoreBarPct(0)
      return
    }
    const id = requestAnimationFrame(() => setScoreBarPct(potentialScore))
    return () => cancelAnimationFrame(id)
  }, [result, potentialScore])

  const canContinue = () => {
    if (isPseudoStep) return pseudo.trim().length > 0
    return !!sel
  }

  const pick = (key: string, val: string) => setAnswers(a => ({ ...a, [key]: val }))

  const next = () => {
    if (step === LAST_STEP) generate()
    else setStep(x => x + 1)
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const pseudoClean = pseudo.replace(/^@+/, '').trim()
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: { ...answers, pseudo: pseudoClean },
        }),
      })
      const data = (await res.json()) as { error?: string } & GeneratePlanResult
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur')
    }
    setLoading(false)
  }

  const restart = () => {
    setStep(0)
    setPseudo('')
    setAnswers({})
    setResult(null)
    setError('')
  }

  if (loading)
    return (
      <main translate="no" className="notranslate min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Ton coach analyse ton profil…</p>
        </div>
      </main>
    )

  if (error)
    return (
      <main translate="no" className="notranslate min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl shadow-black/40">
          <p className="text-red-400 mb-4 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError('')
              setStep(LAST_STEP)
            }}
            className="mr-3 px-4 py-2 bg-zinc-800 rounded-lg text-sm transition-colors hover:bg-zinc-700"
          >
            ← Retour
          </button>
          <button type="button" onClick={generate} className="px-4 py-2 bg-red-500 rounded-lg text-sm font-bold hover:bg-red-400 transition-colors">
            Réessayer
          </button>
        </div>
      </main>
    )

  if (result)
    return (
      <main translate="no" className="notranslate min-h-screen bg-black text-white pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.12),transparent)] pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-5 pt-8 space-y-10">
          <header className="flex items-start justify-between gap-4">
            <BrandMark />
            <button
              type="button"
              onClick={restart}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
            >
              ↺ Recommencer
            </button>
          </header>

          <section className="rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 p-8 shadow-2xl shadow-black/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-500 mb-3 relative">Potentiel TikTok</p>
            <div className="flex flex-wrap items-end gap-2 relative mb-6">
              <span className="text-7xl sm:text-8xl font-black tabular-nums tracking-tight bg-gradient-to-br from-white via-white to-zinc-400 bg-clip-text text-transparent leading-none">
                {potentialScore}
              </span>
              <span className="text-2xl font-bold text-zinc-500 mb-2">/99</span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800 overflow-hidden relative mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-300 to-red-500 transition-[width] duration-[1200ms] ease-out"
                style={{ width: `${scoreBarPct}%` }}
              />
            </div>
            <p className="text-sm text-zinc-400 relative">{result.description}</p>
          </section>

          <section className="rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/10 via-zinc-900/40 to-cyan-500/5 p-6 relative overflow-hidden">
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black text-red-500 mb-2 leading-tight">{result.niche}</h2>
              <p className="font-bold text-white text-lg mb-1">{result.angle}</p>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-base">📅</span> Plan — {answers.frequence} vidéo(s)/semaine
            </h3>
            <ul className="space-y-4">
              {result.plan?.map((item, i: number) => (
                <li
                  key={i}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 hover:border-zinc-700 transition-colors duration-200 shadow-lg shadow-black/20"
                >
                  <div className="flex gap-4 sm:gap-6">
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-inner shadow-black/30">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${FORMAT_BADGE_STYLES[i % FORMAT_BADGE_STYLES.length]}`}
                      >
                        {item.format}
                      </span>
                      <p className="font-bold text-white text-base leading-snug">{item.idee}</p>
                      <blockquote className="border-l-4 border-cyan-500/60 pl-4 py-1 text-sm text-zinc-400 italic leading-relaxed bg-cyan-500/[0.06] rounded-r-lg">
                        « {item.hook} »
                      </blockquote>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-base">💡</span> Conseils
            </h3>
            <ul className="space-y-3">
              {result.conseils?.map((c: string, i: number) => (
                <li key={i} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3.5 hover:bg-zinc-900 transition-colors">
                  <span className="text-xl flex-shrink-0 leading-none mt-0.5" aria-hidden>
                    {CONSEIL_ICONS[i % CONSEIL_ICONS.length]}
                  </span>
                  <span className="text-sm text-zinc-300 leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-3 pt-2">
            <a
              href="/tiktok-coach/chat"
              className="tiktok-coach-chat-cta block w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-center text-base tracking-wide transition-colors"
            >
              💬 Chatter avec ton coach
            </a>
          </div>
        </div>
      </main>
    )

  const pct = Math.round((step / LAST_STEP) * 100)

  return (
    <main translate="no" className="notranslate min-h-screen bg-black text-white p-6 max-w-lg mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(239,68,68,0.08),transparent)] pointer-events-none" />
      <div className="relative">
        <div className="mb-8">
          <BrandMark />
        </div>
        <div className="mb-6">
          <div className="flex justify-between text-[11px] text-zinc-500 mb-2 uppercase tracking-[0.2em] font-semibold">
            <span>Étape {isPseudoStep ? '1 / 6' : s!.label}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-red-500 transition-all duration-300 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div key={step} className="tiktok-coach-step-card bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
          {isPseudoStep ? (
            <>
              <div className="text-[11px] font-bold text-red-500 uppercase tracking-[0.2em] mb-2">Étape 1 / 6</div>
              <div className="text-xl font-bold mb-5 text-white">Quel est ton pseudo TikTok ?</div>
              <input
                type="text"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                placeholder="@tonpseudo"
                className="w-full mb-6 px-4 py-3.5 bg-zinc-950/80 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all"
              />
            </>
          ) : (
            <>
              <div className="text-[11px] font-bold text-red-500 uppercase tracking-[0.2em] mb-2">Étape {s!.label}</div>
              <div className="text-xl font-bold mb-5 text-white">{s!.q}</div>
              <div className="flex flex-col gap-2.5 mb-6">
                {s!.opts.map(o => {
                  const selected = sel === o.v
                  return (
                    <button
                      type="button"
                      key={o.v}
                      onClick={() => pick(s!.key, o.v)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left w-full cursor-pointer transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.99] ${
                        selected
                          ? `tiktok-coach-option-pulse border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.15)]`
                          : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-600 hover:bg-zinc-900/80'
                      }`}
                    >
                      <span className="text-xl">{o.e}</span>
                      <span className="text-sm font-medium text-zinc-100">{o.l}</span>
                      <span
                        className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors duration-150 ${
                          selected ? 'bg-red-500 border-red-400 scale-110' : 'border-zinc-600'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </>
          )}
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(x => x - 1)}
                className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-colors shrink-0"
              >
                ←
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canContinue()}
              className={`flex-1 py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-150 ${
                canContinue()
                  ? 'tiktok-coach-continue-active text-white'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-80'
              }`}
            >
              {step === LAST_STEP ? '🚀 Générer mon plan' : 'Continuer →'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
