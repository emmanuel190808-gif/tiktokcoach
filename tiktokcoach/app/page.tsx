export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">TikTok Coach</h1>
      <p className="text-zinc-400 text-lg mb-8">Ton plan de contenu personnalisé en 5 questions.</p>
      <a href="/onboarding" className="bg-white text-black px-6 py-3 rounded-full font-medium hover:opacity-90 transition">
        Commencer →
      </a>
    </main>
  )
}