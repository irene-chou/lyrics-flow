const LRCLIB_BASE = 'https://lrclib.net/api'

export interface LrclibSearchResult {
  id: number
  name: string
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics: string | null
  syncedLyrics: string | null
}

export async function searchLyrics(
  query: string,
): Promise<LrclibSearchResult[]> {
  const url = `${LRCLIB_BASE}/search?q=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`搜尋失敗 (${res.status})`)
  return res.json()
}
