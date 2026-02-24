import type { SharedSong, Song } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function getHeaders(): HeadersInit {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('缺少 Supabase 設定，請檢查 .env 檔案')
  }
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  }
}

function restUrl(table: string): string {
  return `${SUPABASE_URL}/rest/v1/${table}`
}

/** Check whether cloud library is configured. */
export function isCloudConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/** Search shared songs by name or artist (case-insensitive ilike). */
export async function searchSharedSongs(query: string): Promise<SharedSong[]> {
  const url = new URL(restUrl('shared_songs'))
  // Use PostgREST `or` filter: name or artist contains query
  url.searchParams.set('or', `(name.ilike.*${query}*,artist.ilike.*${query}*)`)
  url.searchParams.set('order', 'published_at.desc')
  url.searchParams.set('limit', '50')

  const res = await fetch(url.toString(), { headers: getHeaders() })
  if (!res.ok) throw new Error(`搜尋失敗 (${res.status})`)
  return res.json()
}

/** Fetch latest shared songs (for initial browse). */
export async function fetchLatestSharedSongs(limit = 30): Promise<SharedSong[]> {
  const url = new URL(restUrl('shared_songs'))
  url.searchParams.set('order', 'published_at.desc')
  url.searchParams.set('limit', String(limit))

  const res = await fetch(url.toString(), { headers: getHeaders() })
  if (!res.ok) throw new Error(`載入失敗 (${res.status})`)
  return res.json()
}

/** Fetch a single shared song by ID. */
export async function getSharedSong(id: string): Promise<SharedSong | null> {
  const url = new URL(restUrl('shared_songs'))
  url.searchParams.set('id', `eq.${id}`)
  url.searchParams.set('limit', '1')

  const res = await fetch(url.toString(), { headers: getHeaders() })
  if (!res.ok) return null
  const data: SharedSong[] = await res.json()
  return data[0] ?? null
}

/** Publish a local song to the shared cloud library. Returns the created SharedSong. */
export async function publishSong(song: Song): Promise<SharedSong> {
  // Split name into song name + artist if it contains " - "
  let name = song.name
  let artist = ''
  const dashIdx = song.name.indexOf(' - ')
  if (dashIdx > 0) {
    name = song.name.slice(0, dashIdx)
    artist = song.name.slice(dashIdx + 3)
  }

  const body = {
    name,
    artist,
    lrc_text: song.lrcText,
    offset: song.offset,
    youtube_id: song.youtubeId,
    duration: 0,
  }

  const res = await fetch(restUrl('shared_songs'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`發布失敗 (${res.status})${text ? `: ${text}` : ''}`)
  }

  const data: SharedSong[] = await res.json()
  return data[0]
}
