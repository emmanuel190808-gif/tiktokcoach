import { NextResponse } from 'next/server'

const RAPID_HOST = 'tiktok-scraper2.p.rapidapi.com'
const RAPID_BASE = `https://${RAPID_HOST}`

function stripAt(username: string) {
  return username.replace(/^@+/u, '').trim()
}

type VideoOut = { title: string; views: number; likes: number; comments: number }

function extractProfile(json: unknown) {
  const j = json as Record<string, unknown>
  const root = (j?.userInfo ?? j?.data ?? j) as Record<string, unknown>
  const user = (root?.user ?? root?.user_detail ?? root) as Record<string, unknown>
  const stats = (root?.stats ?? user?.stats ?? {}) as Record<string, unknown>

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

  return { followers, following, totalLikes, bio }
}

function extractVideoList(json: unknown): unknown[] {
  if (Array.isArray(json)) return json
  const j = json as Record<string, unknown>
  const candidates = [
    j?.data,
    j?.videos,
    j?.itemList,
    j?.userVideos,
    j?.aweme_list,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  const data = j?.data as Record<string, unknown> | undefined
  if (data) {
    const nested = [data.videos, data.itemList, data.items, data.aweme_list]
    for (const c of nested) {
      if (Array.isArray(c)) return c
    }
  }
  return []
}

function mapVideo(v: unknown): VideoOut {
  const item = v as Record<string, unknown>
  const stats = (item.stats ?? item.statistics ?? {}) as Record<string, unknown>
  const title = String(item.desc ?? item.title ?? item.text ?? item.caption ?? '')
  const views = Number(
    item.play_count ??
      item.playCount ??
      stats.playCount ??
      stats.play_count ??
      stats.play_count ??
      0
  )
  const likes = Number(
    item.digg_count ?? item.diggCount ?? stats.diggCount ?? stats.digg_count ?? 0
  )
  const comments = Number(
    item.comment_count ??
      item.commentCount ??
      stats.commentCount ??
      stats.comment_count ??
      0
  )
  return { title, views, likes, comments }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'RAPIDAPI_KEY non configurée' },
        { status: 500 }
      )
    }

    let body: { username?: unknown }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 })
    }

    const raw = body?.username
    if (typeof raw !== 'string' || !stripAt(raw)) {
      return NextResponse.json(
        { error: 'username requis (pseudo sans @)' },
        { status: 400 }
      )
    }
    const username = stripAt(raw)

    const headers = {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPID_HOST,
    }

    const infoUrl = `${RAPID_BASE}/user/info?username=${encodeURIComponent(username)}`
    const videosUrl = `${RAPID_BASE}/user/videos?username=${encodeURIComponent(username)}`

    const [infoRes, videosRes] = await Promise.all([
      fetch(infoUrl, { headers, cache: 'no-store' }),
      fetch(videosUrl, { headers, cache: 'no-store' }),
    ])

    if (!infoRes.ok) {
      const detail = await infoRes.text()
      return NextResponse.json(
        {
          error: 'Échec récupération du profil TikTok',
          status: infoRes.status,
          detail: detail.slice(0, 500),
        },
        { status: infoRes.status >= 400 && infoRes.status < 500 ? infoRes.status : 502 }
      )
    }

    let infoJson: unknown
    try {
      infoJson = await infoRes.json()
    } catch {
      return NextResponse.json(
        { error: 'Réponse profil invalide (non-JSON)' },
        { status: 502 }
      )
    }

    const profile = extractProfile(infoJson)

    let videos: VideoOut[] = []
    if (videosRes.ok) {
      try {
        const videosJson = await videosRes.json()
        videos = extractVideoList(videosJson).slice(0, 10).map(mapVideo)
      } catch {
        videos = []
      }
    }

    return NextResponse.json({
      username,
      followers: profile.followers,
      following: profile.following,
      totalLikes: profile.totalLikes,
      bio: profile.bio,
      videos,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    console.error('tiktok-profile:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
