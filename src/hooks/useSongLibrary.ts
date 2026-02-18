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

// Re-export service functions for backward compatibility
export { saveSongToDB, debouncedSaveSong, deleteSongFromDB, exportSongs, importSongs } from '@/lib/song-service'
