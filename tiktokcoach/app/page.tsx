import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="text-lg font-black tracking-widest">
            <span className="text-cyan-400">Tik</span>Tok<span className="text-red-500">Coach</span>
          </div>
          <Link
            href="/tiktok-coach"
            className="text-sm font-bold text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            Accéder à l&apos;app →
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.08] via-transparent to-cyan-400/[0.06] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,640px)] h-[min(90vw,640px)] rounded-full bg-red-500/[0.04] blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block text-2xl md:text-3xl font-black tracking-[0.2em] mb-8 px-4 py-2 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-cyan-400/5">
              <span className="text-cyan-400">Tik</span>Tok<span className="text-red-500">Coach</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight text-balance mb-6">
              Tu sais que t&apos;as du potentiel.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-red-500">
                T&apos;as juste pas d&apos;idées.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance mb-10">
              TikTokCoach analyse ton profil, génère un plan sur-mesure et devient ton coach personnel
              disponible 24h/24 — pour que tu ne manques plus jamais d&apos;inspiration.
            </p>

            <Link
              href="/tiktok-coach"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-red-500 text-white font-bold text-base md:text-lg shadow-lg shadow-red-500/25 hover:bg-red-400 hover:shadow-red-400/30 transition-all"
            >
              Créer mon plan gratuitement
            </Link>
            <p className="mt-4 text-xs text-zinc-600 uppercase tracking-widest">
              Questionnaire rapide · Résultat instantané
            </p>
          </div>
        </section>

        <section className="px-6 pb-20 md:pb-28 border-t border-zinc-900 bg-zinc-950/50">
          <div className="max-w-5xl mx-auto pt-16 md:pt-20">
            <h2 className="text-center text-xs font-bold uppercase tracking-[0.25em] text-cyan-400 mb-12">
              Pourquoi TikTokCoach
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 hover:border-red-500/40 transition-colors">
                <div className="text-2xl mb-4">📋</div>
                <h3 className="text-lg font-bold text-white mb-2">Plan personnalisé</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Un calendrier d&apos;idées, formats et hooks alignés sur ton objectif — pas un template
                  générique.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 hover:border-cyan-400/40 transition-colors">
                <div className="text-2xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-white mb-2">Coach IA 24h/24</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Pose tes questions après ton plan : tendances, scripts, angles — ton coach répond
                  tout le temps.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 md:p-8 hover:border-red-500/40 transition-colors">
                <div className="text-2xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-white mb-2">Adapté à ta niche</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Mode, business, sport, humour… le plan s&apos;ajuste à ton univers et à ton niveau.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="font-black tracking-widest text-zinc-600">
            <span className="text-cyan-500/80">Tik</span>Tok<span className="text-red-500/80">Coach</span>
          </div>
          <p>© {new Date().getFullYear()} TikTokCoach. Pas affilié à TikTok.</p>
        </div>
      </footer>
    </div>
  )
}
