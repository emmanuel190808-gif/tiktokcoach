import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `Tu es un coach TikTok expert et direct. Tu aides les créateurs de contenu à progresser sur TikTok.
Tu connais parfaitement : les algorithmes TikTok, la création de hooks viraux, les formats qui marchent (POV, storytime, trend, tuto, réaction), la croissance organique, la monétisation (TikTok Shop, affiliés, formations, live).
Ton style : direct, cash, motivant. Tu parles en tutoiement. Tes réponses sont courtes et actionnables (max 150 mots). Tu donnes des exemples concrets. Tu ne fais jamais de réponses génériques.`,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    })

    return NextResponse.json({
      reply: (message.content[0] as any).text
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}