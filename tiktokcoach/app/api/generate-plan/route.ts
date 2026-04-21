import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { answers } = body
    const n = Math.min(parseInt(answers.frequence), 5)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const prompt = `Tu es un expert TikTok growth. Profil :
- Univers : ${answers.univers}
- Objectif : ${answers.objectif}
- Expérience : ${answers.experience}
- Frein : ${answers.frein}
- Fréquence : ${answers.frequence} vidéo(s)/semaine

Réponds UNIQUEMENT en JSON valide, sans backticks ni texte avant/après.
{
  "niche": "Nom court (4-6 mots)",
  "angle": "Angle différenciateur (1 phrase percutante)",
  "description": "Potentiel TikTok en 2 phrases en tutoiement",
  "plan": [exactement ${n} objets avec les champs format, idee, hook],
  "conseils": ["conseil 1","conseil 2","conseil 3"]
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as any).text
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'JSON invalide dans la réponse' }, { status: 500 })

    return NextResponse.json(JSON.parse(match[0]))

  } catch (err: any) {
    console.error('ERREUR ROUTE:', err)
    return NextResponse.json({ error: err.message || 'Erreur inconnue' }, { status: 500 })
  }
}