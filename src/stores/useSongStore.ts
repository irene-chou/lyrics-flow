import { create } from 'zustand'
import type { LyricLine, Song, AudioSource } from '@/types'
import { parseLRC } from '@/lib/lrc-parser'

interface SongSavedState {
  name: string
  lrcText: string
  offset: number
  audioSource: AudioSource
  youtubeId: string | null
  audioFileName: string | null
}

interface SongState {
  // Current song
  currentSongId: number | null
  currentSongTitle: string
  lyrics: LyricLine[]
  offset: number
  lrcText: string
  audioSource: AudioSource
  youtubeId: string | null
  audioFileName: string | null

  // Saved state for dirty tracking
  lastSavedState: SongSavedState | null

  // Actions
  loadSong: (song: Song) => void
  clearSong: () => void
  setOffset: (offset: number) => void
  setLyrics: (lyrics: LyricLine[]) => void
  setLrcText: (text: string) => void
  setAudioSource: (source: AudioSource) => void
  setYoutubeId: (id: string | null) => void
  setAudioFileName: (name: string | null) => void
  captureState: () => void
  hasUnsavedChanges: () => boolean
}

export const useSongStore = create<SongState>((set, get) => ({
  currentSongId: null,
  currentSongTitle: '',
  lyrics: [],
  offset: 0,
  lrcText: '',
  audioSource: 'youtube',
  youtubeId: null,
  audioFileName: null,
  lastSavedState: null,

  loadSong: (song: Song) => {
    const { lyrics, title } = parseLRC(song.lrcText)
    const songTitle = song.name || title || '未命名歌曲'

    set({
      currentSongId: song.id,
      currentSongTitle: songTitle,
      lyrics,
      offset: song.offset,
      lrcText: song.lrcText,
      audioSource: song.audioSource,
      youtubeId: song.youtubeId,
      audioFileName: song.audioFileName,
      lastSavedState: {
        name: songTitle,
        lrcText: song.lrcText,
        offset: song.offset,
        audioSource: song.audioSource,
        youtubeId: song.youtubeId,
        audioFileName: song.audioFileName,
      },
    })
  },

  clearSong: () => {
    set({
      currentSongId: null,
      currentSongTitle: '',
      lyrics: [],
      offset: 0,
      lrcText: '',
      audioSource: 'youtube',
      youtubeId: null,
      audioFileName: null,
      lastSavedState: null,
    })
  },

  setOffset: (offset: number) => set({ offset }),
  setLyrics: (lyrics: LyricLine[]) => set({ lyrics }),
  setLrcText: (text: string) => set({ lrcText: text }),
  setAudioSource: (source: AudioSource) => set({ audioSource: source }),
  setYoutubeId: (id: string | null) => set({ youtubeId: id }),
  setAudioFileName: (name: string | null) => set({ audioFileName: name }),

  captureState: () => {
    const state = get()
    set({
      lastSavedState: {
        name: state.currentSongTitle,
        lrcText: state.lrcText,
        offset: state.offset,
        audioSource: state.audioSource,
        youtubeId: state.youtubeId,
        audioFileName: state.audioFileName,
      },
    })
  },

  hasUnsavedChanges: () => {
    const state = get()
    if (!state.lastSavedState) return false
    const saved = state.lastSavedState
    return (
      state.currentSongTitle !== saved.name ||
      state.lrcText !== saved.lrcText ||
      state.offset !== saved.offset ||
      state.audioSource !== saved.audioSource ||
      state.youtubeId !== saved.youtubeId ||
      state.audioFileName !== saved.audioFileName
    )
  },
}))
