import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/**
 * Live query: returns all songs sorted by id descending.
 */
export function useSongs() {
  return useLiveQuery(() =>
    db.songs.orderBy('id').reverse().toArray(),
  )
}

/**
 * Live query: returns a Set of song IDs that have cached audio files.
 */
export function useCachedSongIds() {
  return useLiveQuery(() =>
    db.audioFiles.toCollection().primaryKeys().then(keys => new Set(keys)),
  )
}

// Re-export service functions for backward compatibility
export { saveSongToDB, debouncedSaveSong, deleteSongFromDB, exportSongs, importSongs } from '@/lib/song-service'
