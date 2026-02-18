import { create } from 'zustand'
import type { PlaybackStatus } from '@/types'

interface PlaybackState {
  status: PlaybackStatus
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  isManualMode: boolean
  audioFileObjectUrl: string | null

  // Actions
  setStatus: (status: PlaybackStatus) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  setManualMode: (manual: boolean) => void
  setAudioFileObjectUrl: (url: string | null) => void
  reset: () => void
}

const initialState = {
  status: 'IDLE' as PlaybackStatus,
  currentTime: 0,
  duration: 0,
  volume: 100,
  muted: false,
  isManualMode: false,
  audioFileObjectUrl: null,
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  ...initialState,

  setStatus: (status) => set({ status }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setMuted: (muted) => set({ muted }),
  toggleMute: () => {
    const { muted, volume } = get()
    if (muted) {
      set({ muted: false })
    } else {
      set({ muted: true })
    }
    // Volume value is preserved; muted flag controls actual audio output
    void volume
  },
  setManualMode: (isManualMode) => set({ isManualMode }),
  setAudioFileObjectUrl: (audioFileObjectUrl) => {
    // Revoke previous URL to prevent memory leaks
    const prev = get().audioFileObjectUrl
    if (prev) {
      URL.revokeObjectURL(prev)
    }
    set({ audioFileObjectUrl })
  },
  reset: () => {
    const prev = get().audioFileObjectUrl
    if (prev) {
      URL.revokeObjectURL(prev)
    }
    set({ ...initialState })
  },
}))
