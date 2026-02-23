import { create } from 'zustand'
import type { CloudSong, CloudSearchParams, CloudLyricsProvider } from '@/types'
import { lrclibProvider } from '@/lib/lrclib'

interface CloudLibraryState {
  /** Current search query text */
  query: string
  /** Search results */
  results: CloudSong[]
  /** Loading state */
  isSearching: boolean
  /** Error message from last search */
  error: string | null
  /** ID of the song currently being imported */
  importingId: number | null
  /** The active lyrics provider */
  provider: CloudLyricsProvider

  // Actions
  setQuery: (query: string) => void
  search: (params?: CloudSearchParams) => Promise<void>
  clearResults: () => void
  setImportingId: (id: number | null) => void
}

export const useCloudLibraryStore = create<CloudLibraryState>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  error: null,
  importingId: null,
  provider: lrclibProvider,

  setQuery: (query: string) => set({ query }),

  search: async (params?: CloudSearchParams) => {
    const state = get()
    const searchParams = params ?? { q: state.query.trim() }

    if (!searchParams.q && !searchParams.trackName) {
      set({ results: [], error: null })
      return
    }

    set({ isSearching: true, error: null })

    try {
      const results = await state.provider.search(searchParams)
      set({ results, isSearching: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '搜尋失敗'
      set({ results: [], isSearching: false, error: message })
    }
  },

  clearResults: () => set({ results: [], error: null, query: '' }),

  setImportingId: (id: number | null) => set({ importingId: id }),
}))
