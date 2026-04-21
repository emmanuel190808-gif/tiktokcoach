'use client'
import { useState } from 'react'

const STEPS = [
  { key: 'pseudo', label: '1 / 6', q: 'Quel est ton pseudo TikTok ?' },
  { key: 'univers', label: '2 / 6', q: "C'est quoi ton univers ?", opts: [
    { e: '👟', l: 'Mode, sneakers, style', v: 'mode/sneakers/style' },
    { e: '💰', l: 'Argent, business, entrepreneuriat', v: 'business/entrepreneuriat' },
    { e: '🏋️', l: 'Sport, fitness, santé', v: 'sport/fitness' },
    { e: '🎮', l: 'Gaming, tech, culture web', v: 'gaming/tech' },
    { e: '✈️', l: 'Lifestyle, voyage, food', v: 'lifestyle/voyage' },
    { e: '😂', l: 'Humour, sketchs, quotidien', v: 'humour/sketchs' },
    { e: '✏️', l: 'Autre — je décris mon univers', v: '__autre__' },
  ]},
  { key: 'objectif', label: '3 / 6', q: 'Ton objectif principal ?', opts: [
    { e: '🔥', l: 'Devenir viral vite', v: 'devenir viral rapidement' },
    { e: '💸', l: 'Monétiser, générer des revenus', v: 'monétiser et générer des revenus' },
    { e: '🌟', l: 'Construire une communauté', v: 'construire une communauté engagée' },
    { e: '🚀', l: 'Promouvoir mon business/produit', v: 'promouvoir un business ou produit' },
  ]},
  { key: 'experience', label: '4 / 6', q: 'Ton niveau sur TikTok ?', opts: [
    { e: '🆕', l: 'Débutant total — 0 vidéo', v: 'débutant total' },
    { e: '📱', l: 'Quelques vidéos, aucun résultat', v: 'quelques vidéos sans résultats' },
    { e: '📈', l: 'Actif mais bloqué', v: 'actif mais bloqué' },
    { e: '💪', l: "J'ai eu des vidéos virales", v: 'expérimenté avec vidéos virales' },
  ]},
  { key: 'frein', label: '5 / 6', q: 'Ton plus grand frein ?', opts: [
    { e: '🧠', l: 'Je ne sais pas quoi filmer', v: "manque d'idées" },
    { e: '😰', l: 'Peur du regard des autres', v: 'peur du regard des autres' },
    { e: '⏰', l: 'Je manque de temps', v: 'manque de temps' },
    { e: '📉', l: 'Mes vidéos ne décollent pas', v: 'vidéos sans engagement' },
  ]},
  { key: 'frequence', label: '6 / 6', q: 'Combien de vidéos par semaine ?', opts: [
    { e: '🌱', l: '1 vidéo — je teste', v: '1' },
    { e: '⚡', l: '3 vidéos — rythme sérieux', v: '3' },
    { e: '🔥', l: '5 vidéos — full grind', v: '5' },
    { e: '💥', l: '7+ — je veux exploser', v: '7' },
  ]},
]

/** Ne lève jamais ; retourne null si /api/tiktok-profile échoue. */
async function fetchTiktokProfileSilently(username: string): Promise<unknown> {
  try {
    const profileRes = await fetch('/api/tiktok-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const profileJson = await profileRes.json()
    if (profileJson?.profileData != null) {
      return profileJson.profileData
    }
  } catch {
    /* ignoré : génération du plan continue sans profil */
  }
  return null
}

export default function TikTokCoach() {
  const [step, setStep] = useState(0)
  const [pseudoText, setPseudoText] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [autreText, setAutreText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const s = STEPS[step]
  const sel = answers[s?.key]

  const pick = (key: string, val: string) => setAnswers(a => ({ ...a, [key]: val }))

  const getAnswerValue = (key: string) => {
    if (key === 'univers' && answers[key] === '__autre__') return autreText || 'univers non précisé'
    return answers[key]
  }

  const canContinue = () => {
    if (s.key === 'pseudo') return pseudoText.trim().length > 0
    if (!sel) return false
    if (s.key === 'univers' && sel === '__autre__' && !autreText.trim()) return false
    return true
  }

  const next = () => {
    if (step === 5) generate()
    else setStep(x => x + 1)
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    const username = pseudoText.replace(/^@+/, '').trim()
    const tiktokProfile = await fetchTiktokProfileSilently(username)

    try {
      const finalAnswers = {
        univers: getAnswerValue('univers'),
        objectif: answers.objectif,
        experience: answers.experience,
        frein: answers.frein,
        frequence: answers.frequence,
      }
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers, tiktokProfile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setResult(data)
    } catch (e: any) {
      setError(typeof e?.message === 'string' ? e.message : 'Erreur serveur')
    } finally {
      setLoading(false)
    }
  }

  const restart = () => {
    setStep(0)
    setPseudoText('')
    setAnswers({})
    setAutreText('')
    setResult(null)
    setError('')
  }

  if (loading) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-zinc-700 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Ton coach analyse ton profil…</p>
      </div>
    </main>
  )

  if (error) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-red-400 mb-4 text-sm">{error}</p>
        <button onClick={() => { setError(''); setStep(5) }} className="mr-3 px-4 py-2 bg-zinc-800 rounded-lg text-sm">← Retour</button>
        <button onClick={generate} className="px-4 py-2 bg-red-500 rounded-lg text-sm font-bold">Réessayer</button>
      </div>
    </main>
  )

  if (result) return (
    <main className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <div className="text-xl font-black tracking-widest mb-6">
        <span className="text-cyan-400">Tik</span>Tok<span className="text-red-500">Coach</span>
      </div>
      <div className="bg-gradient-to-br from-red-500/10 to-cyan-400/5 border border-red-500/30 rounded-xl p-5 mb-6">
        <h1 className="text-3xl font-black text-red-500 mb-1">{result.niche}</h1>
        <p className="font-bold mb-2">{result.angle}</p>
        <p className="text-zinc-400 text-sm">{result.description}</p>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">📅 Plan — {answers.frequence} vidéo(s)/semaine</p>
      {result.plan?.map((item: any, i: number) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3 flex gap-4">
          <span className="text-red-500 font-black text-2xl min-w-[32px]">J{i+1}</span>
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase mb-1">{item.format}</div>
            <div className="font-semibold text-sm mb-1">{item.idee}</div>
            <div className="text-xs text-zinc-500 italic">"{item.hook}"</div>
          </div>
        </div>
      ))}
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mt-6 mb-3">💡 Conseils</p>
      {result.conseils?.map((c: string, i: number) => (
        <div key={i} className="flex gap-2 text-sm text-zinc-400 mb-2">
          <span className="text-red-500 font-bold flex-shrink-0">→</span>{c}
        </div>
      ))}
      <a href="/tiktok-coach/chat"
        className="mt-6 w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm text-center block">
        💬 Chatter avec ton coach
      </a>
      <button onClick={restart} className="mt-3 w-full py-3 bg-zinc-900 text-zinc-400 rounded-xl font-semibold border border-zinc-800">↺ Recommencer</button>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-lg mx-auto">
      <div className="text-xl font-black tracking-widest mb-8">
        <span className="text-cyan-400">Tik</span>Tok<span className="text-red-500">Coach</span>
      </div>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-zinc-600 mb-2 uppercase tracking-widest">
          <span>Étape {s.label}</span><span>{Math.round((step / 6) * 100)}%</span>
        </div>
        <div className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-red-500 transition-all duration-300"
            style={{ width: `${Math.round((step / 6) * 100)}%` }} />
        </div>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Étape {s.label}</div>
        <div className="text-xl font-bold mb-5">{s.q}</div>
        {s.key === 'pseudo' ? (
          <input
            type="text"
            value={pseudoText}
            onChange={e => setPseudoText(e.target.value)}
            placeholder="@tonpseudo"
            autoComplete="username"
            className="w-full mb-4 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 transition-colors"
          />
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {s.opts!.map(o => (
              <div key={o.v} onClick={() => pick(s.key, o.v)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  sel === o.v ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-600'
                }`}>
                <span className="text-lg">{o.e}</span>
                <span className="text-sm font-medium">{o.l}</span>
                <span className={`ml-auto w-4 h-4 rounded-full border flex-shrink-0 ${
                  sel === o.v ? 'bg-red-500 border-red-500' : 'border-zinc-600'
                }`} />
              </div>
            ))}
          </div>
        )}
        {s.key === 'univers' && sel === '__autre__' && (
          <input
            type="text"
            value={autreText}
            onChange={e => setAutreText(e.target.value)}
            placeholder="Décris ton univers en quelques mots…"
            className="w-full mb-4 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 transition-colors"
          />
        )}
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(x => x - 1)}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-bold">←</button>
          )}
          <button onClick={next} disabled={!canContinue()}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              canContinue() ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}>
            {step === 5 ? '🚀 Générer mon plan' : 'Continuer →'}
          </button>
        </div>
      </div>
    </main>
  )
}