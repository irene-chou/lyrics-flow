import { db } from '@/lib/db'
import type { Song, AudioFile } from '@/types'
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
      pitch: state.pitch,
      audioSource: state.audioSource,
      youtubeId: state.youtubeId,
      audioFileName: state.audioFileName,
      audioUrl: state.audioUrl,
      createdAt: state.currentSongCreatedAt || Date.now(),
      updatedAt: Date.now(),
    })
    useSongStore.getState().captureState()
  }, delay)
}

/**
 * Delete a song and its cached audio file from IndexedDB by id.
 */
export async function deleteSongFromDB(id: number): Promise<void> {
  await db.transaction('rw', db.songs, db.audioFiles, async () => {
    await db.songs.delete(id)
    await db.audioFiles.delete(id)
  })
}

/**
 * Save an audio file blob to IndexedDB, keyed by song ID.
 */
export async function saveAudioFile(songId: number, blob: Blob, fileName: string): Promise<void> {
  await db.audioFiles.put({ songId, blob, fileName })
}

/**
 * Get a cached audio file from IndexedDB by song ID.
 */
export async function getAudioFile(songId: number): Promise<AudioFile | undefined> {
  return db.audioFiles.get(songId)
}

/**
 * Delete a cached audio file from IndexedDB by song ID.
 */
export async function deleteAudioFile(songId: number): Promise<void> {
  await db.audioFiles.delete(songId)
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
    (s.pitch === undefined || (typeof s.pitch === 'number' && Number.isFinite(s.pitch))) &&
    (s.audioSource === 'youtube' || s.audioSource === 'local' || s.audioSource === 'url') &&
    (s.youtubeId === null || typeof s.youtubeId === 'string') &&
    (s.audioFileName === null || typeof s.audioFileName === 'string') &&
    (s.audioUrl === undefined || s.audioUrl === null || typeof s.audioUrl === 'string') &&
    typeof s.createdAt === 'number' &&
    typeof s.updatedAt === 'number'
  )
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
      const { id, name, lrcText, offset, pitch = 0, audioSource, youtubeId, audioFileName, audioUrl = null, createdAt, updatedAt } = item
      await db.songs.put({ id, name, lrcText, offset, pitch, audioSource, youtubeId, audioFileName, audioUrl, createdAt, updatedAt })
      count++
    }
  }
  return count
}
