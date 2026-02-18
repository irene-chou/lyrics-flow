import { create } from 'zustand'

interface SyncState {
  currentLineIndex: number
  isSyncing: boolean

  setCurrentLineIndex: (index: number) => void
  setSyncing: (syncing: boolean) => void
  reset: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  currentLineIndex: -1,
  isSyncing: false,

  setCurrentLineIndex: (currentLineIndex) => set({ currentLineIndex }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  reset: () => set({ currentLineIndex: -1, isSyncing: false }),
}))
