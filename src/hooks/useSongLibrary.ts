import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Song } from '@/types'

/**
 * Live query: returns all songs sorted by updatedAt descending.
 */
export function useSongs() {
  return useLiveQuery(() =>
    db.songs.orderBy('id').reverse().toArray(),
  )
}

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

/**
 * Import songs from a JSON file, merging into IndexedDB.
 */
export async function importSongs(file: File): Promise<number> {
  const text = await file.text()
  const songs: Song[] = JSON.parse(text)

  if (!Array.isArray(songs)) {
    throw new Error('無效的匯入檔案格式')
  }

  let count = 0
  for (const song of songs) {
    if (song.id && song.name && song.lrcText !== undefined) {
      await db.songs.put(song)
      count++
    }
  }
  return count
}
