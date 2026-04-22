import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

type TikTokVideo = { title?: string; views?: number; likes?: number }
type TikTokProfile = {
  username?: string
  followers?: number
  totalLikes?: number
  bio?: string
  videos?: TikTokVideo[]
}

function formatTikTokBlock(profile: TikTokProfile | undefined) {
  if (!profile || typeof profile !== 'object') {
    return '(données TikTok non fournies)'
  }
  const lines = [
    `- Compte : @${String(profile.username ?? '?')}`,
    `- Abonnés : ${profile.followers ?? '?'}`,
    `- Likes totaux (profil) : ${profile.totalLikes ?? '?'}`,
    `- Bio : ${profile.bio ? String(profile.bio) : '(vide)'}`,
  ]
  const vids = (profile.videos ?? []).slice(0, 3)
  if (vids.length === 0) {
    lines.push('- 3 dernières vidéos : aucune donnée')
  } else {
    lines.push('- 3 dernières vidéos :')
    vids.forEach((v, i) => {
      const title = (v.title ?? '').replace(/\s+/g, ' ').trim().slice(0, 160)
      lines.push(
        `  ${i + 1}. « ${title || '(sans titre)'} » — vues: ${v.views ?? '?'}, likes: ${v.likes ?? '?'}`
      )
    })
  }
  return lines.join('\n')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { answers, tiktokProfile } = body
    const n = Math.min(parseInt(answers.frequence), 5)

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const rawPseudo = (answers.pseudo as string | undefined) ?? ''
    const pseudoForPrompt = String(rawPseudo).replace(/^@+/, '').trim()

    const prompt = `Tu es un expert TikTok growth. Profil (questionnaire) :
- Pseudo TikTok : @${pseudoForPrompt}
- Univers : ${answers.univers}
- Objectif : ${answers.objectif}
- Expérience : ${answers.experience}
- Frein : ${answers.frein}
- Fréquence : ${answers.frequence} vidéo(s)/semaine

Données TikTok réelles du compte (scraping) :
${formatTikTokBlock(tiktokProfile as TikTokProfile)}

Réponds UNIQUEMENT en JSON valide, sans backticks ni texte avant/après.
{
  "niche": "Nom court (4-6 mots)",
  "angle": "Angle différenciateur (1 phrase percutante)",
  "description": "Potentiel TikTok en 2 phrases en tutoiement",
  "plan": [exactement ${n} objets avec les champs format, idee, hook],
  "conseils": ["conseil 1","conseil 2","conseil 3"]
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
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