import { create } from 'zustand'
import type { SharedSong } from '@/types'
import {
  searchSharedSongs,
  fetchLatestSharedSongs,
  isCloudConfigured,
} from '@/lib/supabase'

interface CloudLibraryState {
  /** Current search query text */
  query: string
  /** Search / browse results */
  results: SharedSong[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** ID of the song currently being imported */
  importingId: string | null
  /** Whether a publish is in progress */
  isPublishing: boolean
  /** Whether the initial latest songs have been loaded */
  hasLoadedLatest: boolean

  // Actions
  setQuery: (query: string) => void
  search: (query?: string) => Promise<void>
  loadLatest: () => Promise<void>
  clearResults: () => void
  setImportingId: (id: string | null) => void
  setIsPublishing: (v: boolean) => void
}

export const useCloudLibraryStore = create<CloudLibraryState>((set, get) => ({
  query: '',
  results: [],
  isLoading: false,
  error: null,
  importingId: null,
  isPublishing: false,
  hasLoadedLatest: false,

  setQuery: (query: string) => set({ query }),

  search: async (query?: string) => {
    const q = (query ?? get().query).trim()
    if (!isCloudConfigured()) {
      set({ error: '尚未設定雲端歌曲庫，請檢查 .env 檔案', results: [] })
      return
    }

    // If no query, load latest instead
    if (!q) {
      await get().loadLatest()
      return
    }

    set({ isLoading: true, error: null })
    try {
      const results = await searchSharedSongs(q)
      set({ results, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜尋失敗'
      set({ results: [], isLoading: false, error: message })
    }
  },

  loadLatest: async () => {
    if (!isCloudConfigured()) {
      set({ error: '尚未設定雲端歌曲庫，請檢查 .env 檔案', results: [] })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const results = await fetchLatestSharedSongs()
      set({ results, isLoading: false, hasLoadedLatest: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入失敗'
      set({ results: [], isLoading: false, error: message })
    }
  },

  clearResults: () => set({ results: [], error: null, query: '', hasLoadedLatest: false }),

  setImportingId: (id: string | null) => set({ importingId: id }),
  setIsPublishing: (v: boolean) => set({ isPublishing: v }),
}))
