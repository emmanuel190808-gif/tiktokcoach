'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const questions = [
  {
    key: 'univers',
    question: "C'est quoi ton univers ?",
    options: [
      { label: 'Mode, sneakers, style', value: 'mode' },
      { label: 'Argent, business, entrepreneuriat', value: 'argent' },
      { label: 'Sport, fitness, santé', value: 'sport' },
      { label: 'Gaming, tech, culture web', value: 'gaming' },
      { label: 'Lifestyle, voyage, food', value: 'lifestyle' },
      { label: 'Humour, sketchs, quotidien', value: 'humour' },
    ]
  },
  {
    key: 'objectif',
    question: 'Ton objectif sur TikTok ?',
    options: [
      { label: 'Devenir connu, avoir des followers', value: 'notoriete' },
      { label: 'Monétiser, faire de l\'argent', value: 'monetiser' },
      { label: 'Promouvoir mon projet ou ma marque', value: 'projet' },
      { label: 'M\'exprimer, créer pour le fun', value: 'fun' },
    ]
  },
  {
    key: 'experience',
    question: 'T\'as déjà posté sur TikTok ?',
    options: [
      { label: 'Jamais, c\'est ma première fois', value: 'jamais' },
      { label: 'Quelques vidéos, rien de régulier', value: 'quelques' },
      { label: 'J\'ai posté puis j\'ai arrêté', value: 'arrete' },
    ]
  },
  {
    key: 'frein',
    question: 'Ce qui te bloque le plus pour poster ?',
    options: [
      { label: 'Je sais pas quoi dire', value: 'idees' },
      { label: 'Le regard des autres, la honte', value: 'regard' },
      { label: 'Peur que ça soit nul', value: 'qualite' },
      { label: 'Je sais pas être régulier', value: 'regularite' },
    ]
  },
  {
    key: 'frequence',
    question: 'Combien de vidéos par semaine ?',
    options: [
      { label: '1 / semaine', value: '1' },
      { label: '2 / semaine', value: '2' },
      { label: '3 / semaine', value: '3' },
      { label: '5+ / semaine', value: '5' },
    ]
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()

  const current = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  function handleSelect(value: string) {
    setSelected(value)
  }

  function handleNext() {
    if (!selected) return
    const newAnswers = { ...answers, [current.key]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      const params = new URLSearchParams(newAnswers)
      router.push(`/plan?${params.toString()}`)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="w-full bg-zinc-800 rounded-full h-1 mb-10">
          <div className="bg-white h-1 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <p className="text-zinc-500 text-sm mb-3">Question {step + 1} sur {questions.length}</p>
        <h2 className="text-2xl font-bold mb-8">{current.question}</h2>

        <div className="flex flex-col gap-3 mb-10">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`text-left px-5 py-4 rounded-xl border transition-all ${
                selected === opt.value
                  ? 'border-white bg-zinc-900'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => { setStep(step - 1); setSelected(answers[questions[step-1].key] || null) }}
              className="px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 hover:border-zinc-600 transition">
              ← Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex-1 px-5 py-3 rounded-xl bg-white text-black font-medium disabled:opacity-30 hover:opacity-90 transition">
            {step === questions.length - 1 ? 'Générer mon plan →' : 'Continuer →'}
          </button>
        </div>
      </div>
    </main>
  )
}