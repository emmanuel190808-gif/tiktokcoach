import { NextResponse } from 'next/server'

const RAPID_HOST = 'tiktok-scraper2.p.rapidapi.com'
const USER_INFO = `https://${RAPID_HOST}/user/info`

function stripAt(username: string) {
  return username.replace(/^@+/, '').trim()
}

function extractProfile(username: string, json: unknown) {
  const j = json as Record<string, unknown> | null
  if (j == null || typeof j !== 'object') return null
  if (Object.keys(j as object).length === 0) return null
  if ('userInfo' in j && j.userInfo == null) return null
  if ('data' in j && j.data == null) return null

  const root = (j.userInfo ?? j.data ?? j) as Record<string, unknown>
  if (root == null || typeof root !== 'object') return null

  const user = (root.user ?? root.user_detail ?? root) as Record<string, unknown> | undefined
  const stats = (root.stats ?? user?.stats ?? {}) as Record<string, unknown>

  const followers = Number(
    stats.followerCount ??
      stats.follower_count ??
      user?.followerCount ??
      user?.follower_count ??
      0
  )
  const following = Number(
    stats.followingCount ??
      stats.following_count ??
      user?.followingCount ??
      user?.following_count ??
      0
  )
  const totalLikes = Number(
    stats.heartCount ??
      stats.heart_count ??
      user?.heartCount ??
      user?.totalFavorited ??
      user?.like_count ??
      0
  )
  const bio = String(user?.signature ?? user?.bio ?? user?.desc ?? '')

  return {
    username,
    followers: Number.isFinite(followers) ? followers : 0,
    following: Number.isFinite(following) ? following : 0,
    totalLikes: Number.isFinite(totalLikes) ? totalLikes : 0,
    bio,
    videos: [] as { title: string; views: number; likes: number; comments: number }[],
  }
}

export async function POST(req: Request) {
  const fail = (message: string) =>
    NextResponse.json({ profileData: null, error: message }, { status: 200 })

  try {
    let body: { username?: unknown }
    try {
      body = await req.json()
    } catch {
      return fail('Body JSON invalide')
    }

    const raw = body?.username
    if (typeof raw !== 'string' || !stripAt(raw)) {
      return fail('Pseudo manquant')
    }
    const username = stripAt(raw)

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return fail('RAPIDAPI_KEY non configurée')
    }

    const url = `${USER_INFO}?username=${encodeURIComponent(username)}`
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': RAPID_HOST,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return fail(
        `API TikTok indisponible (${res.status})${text ? ` — ${text.slice(0, 200)}` : ''}`
      )
    }

    let json: unknown
    try {
      json = await res.json()
    } catch {
      return fail('Réponse profil invalide (non-JSON)')
    }

    const profile = extractProfile(username, json)
    if (profile == null) {
      return fail('Profil vide ou introuvable')
    }

    return NextResponse.json({ profileData: profile }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('tiktok-profile:', err)
    return NextResponse.json({ profileData: null, error: message }, { status: 200 })
  }
}
