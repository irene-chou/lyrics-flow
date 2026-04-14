import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

/**
 * Live query: returns all songs sorted alphabetically by name (zh-TW locale).
 */
export function useSongs() {
  return useLiveQuery(() =>
    db.songs.toArray().then(songs =>
      songs.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
    )
  )
}

/**
 * Live query: returns all folders sorted alphabetically by name (zh-TW locale).
 */
export function useFolders() {
  return useLiveQuery(() =>
    db.folders.toArray().then(folders =>
      folders.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'))
    )
  )
}

// Re-export service functions for backward compatibility
export {
  saveSongToDB,
  debouncedSaveSong,
  deleteSongFromDB,
  exportSongs,
  importSongs,
  createFolder,
  updateFolder,
  deleteFolder,
  moveSongToFolder,
} from '@/lib/song-service'
