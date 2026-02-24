import { db } from '@/lib/db'
import type { Song, SharedSong } from '@/types'
import { useSongStore } from '@/stores/useSongStore'

/**
 * Save (upsert) a song to IndexedDB.
 */
export async function saveSongToDB(song: Song): Promise<void> {
  await db.songs.put(song)
}

/**
 * Debounced auto-save: saves the current song state to DB after a delay.
 * Repeated calls within the delay window reset the timer.
 */
let _autoSaveTimer: ReturnType<typeof setTimeout> | null = null

export function debouncedSaveSong(delay = 600) {
  if (_autoSaveTimer) clearTimeout(_autoSaveTimer)
  _autoSaveTimer = setTimeout(async () => {
    const state = useSongStore.getState()
    if (!state.currentSongId) return
    await saveSongToDB({
      id: state.currentSongId,
      name: state.currentSongTitle,
      lrcText: state.lrcText,
      offset: state.offset,
      audioSource: state.audioSource,
      youtubeId: state.youtubeId,
      audioFileName: state.audioFileName,
      createdAt: state.currentSongCreatedAt || Date.now(),
      updatedAt: Date.now(),
    })
    useSongStore.getState().captureState()
  }, delay)
}

/**
 * Delete a song from IndexedDB by id.
 */
export async function deleteSongFromDB(id: number): Promise<void> {
  await db.songs.delete(id)
}

/**
 * Export all songs as a JSON file download.
 */
export async function exportSongs(): Promise<void> {
  const songs = await db.songs.toArray()
  const json = JSON.stringify(songs, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lyribox-songs-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function isValidSong(obj: unknown): obj is Song {
  if (typeof obj !== 'object' || obj === null) return false
  const s = obj as Record<string, unknown>
  return (
    typeof s.id === 'number' && s.id > 0 &&
    typeof s.name === 'string' && s.name.length > 0 && s.name.length <= 500 &&
    typeof s.lrcText === 'string' &&
    typeof s.offset === 'number' && Number.isFinite(s.offset) &&
    (s.audioSource === 'youtube' || s.audioSource === 'local') &&
    (s.youtubeId === null || typeof s.youtubeId === 'string') &&
    (s.audioFileName === null || typeof s.audioFileName === 'string') &&
    typeof s.createdAt === 'number' &&
    typeof s.updatedAt === 'number'
  )
}

/**
 * Import a shared cloud song into the local library.
 * Converts SharedSong to Song and saves to IndexedDB.
 * Returns the created Song.
 */
export async function importSharedSong(shared: SharedSong): Promise<Song> {
  const now = Date.now()
  const name = shared.artist
    ? `${shared.name} - ${shared.artist}`
    : shared.name

  const song: Song = {
    id: now,
    name,
    lrcText: shared.lrc_text,
    offset: shared.offset,
    audioSource: 'youtube',
    youtubeId: shared.youtube_id,
    audioFileName: null,
    createdAt: now,
    updatedAt: now,
  }

  await saveSongToDB(song)
  return song
}

/**
 * Import songs from a JSON file, merging into IndexedDB.
 */
export async function importSongs(file: File): Promise<number> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('無效的 JSON 格式')
  }

  if (!Array.isArray(parsed)) {
    throw new Error('無效的匯入檔案格式')
  }

  let count = 0
  for (const item of parsed) {
    if (isValidSong(item)) {
      const { id, name, lrcText, offset, audioSource, youtubeId, audioFileName, createdAt, updatedAt } = item
      await db.songs.put({ id, name, lrcText, offset, audioSource, youtubeId, audioFileName, createdAt, updatedAt })
      count++
    }
  }
  return count
}
