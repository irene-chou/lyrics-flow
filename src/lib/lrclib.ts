import type { CloudSong, CloudSearchParams, CloudLyricsProvider } from '@/types'

const BASE_URL = 'https://lrclib.net/api'
const USER_AGENT = 'Lyribox/0.1.0 (https://github.com/user/lyribox)'

interface LrclibResponse {
  id: number
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics: string | null
  syncedLyrics: string | null
}

function toCloudSong(item: LrclibResponse): CloudSong {
  return {
    id: item.id,
    trackName: item.trackName ?? '',
    artistName: item.artistName ?? '',
    albumName: item.albumName ?? '',
    duration: item.duration ?? 0,
    instrumental: item.instrumental ?? false,
    plainLyrics: item.plainLyrics ?? null,
    syncedLyrics: item.syncedLyrics ?? null,
  }
}

async function lrclibFetch(path: string, params?: Record<string, string>): Promise<Response> {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value)
    }
  }
  return fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
  })
}

export const lrclibProvider: CloudLyricsProvider = {
  name: 'LRCLIB',

  async search(params: CloudSearchParams): Promise<CloudSong[]> {
    const queryParams: Record<string, string> = {}
    if (params.q) queryParams.q = params.q
    if (params.trackName) queryParams.track_name = params.trackName
    if (params.artistName) queryParams.artist_name = params.artistName
    if (params.albumName) queryParams.album_name = params.albumName

    const res = await lrclibFetch('/search', queryParams)
    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error(`LRCLIB search failed: ${res.status}`)
    }

    const data: LrclibResponse[] = await res.json()
    return data.map(toCloudSong)
  },

  async getById(id: number): Promise<CloudSong | null> {
    const res = await lrclibFetch(`/get/${id}`)
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`LRCLIB get failed: ${res.status}`)
    }

    const data: LrclibResponse = await res.json()
    return toCloudSong(data)
  },
}
