import { db } from '@/lib/db'
import type { Song } from '@/types'

/**
 * Save (upsert) a song to IndexedDB.
 */
export async function saveSongToDB(song: Song): Promise<void> {
  await db.songs.put(song)
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
  a.download = `lyrics-flow-songs-${new Date().toISOString().slice(0, 10)}.json`
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
