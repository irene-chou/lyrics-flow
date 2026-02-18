import { useEffect, useRef } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import type { SyncMessageType } from '@/types'

interface UseSyncBroadcastOptions {
  broadcast: (type: SyncMessageType, data: Record<string, unknown>) => void
}

export function useSyncBroadcast({ broadcast }: UseSyncBroadcastOptions) {
  const broadcastRef = useRef(broadcast)
  broadcastRef.current = broadcast

  // Watch currentLineIndex
  useEffect(() => {
    let prev = useSyncStore.getState().currentLineIndex
    const unsub = useSyncStore.subscribe((state) => {
      if (state.currentLineIndex !== prev) {
        prev = state.currentLineIndex
        broadcastRef.current('SYNC_UPDATE', { currentLineIndex: state.currentLineIndex })
      }
    })
    return unsub
  }, [])

  // Watch lyrics changes (song loaded)
  useEffect(() => {
    let prev = useSongStore.getState().lyrics
    const unsub = useSongStore.subscribe((state) => {
      if (state.lyrics !== prev) {
        prev = state.lyrics
        broadcastRef.current('LYRICS_LOADED', {
          lyrics: state.lyrics,
          songTitle: state.currentSongTitle,
        })
      }
    })
    return unsub
  }, [])

  // Watch offset changes
  useEffect(() => {
    let prev = useSongStore.getState().offset
    const unsub = useSongStore.subscribe((state) => {
      if (state.offset !== prev) {
        prev = state.offset
        broadcastRef.current('OFFSET', { offset: state.offset })
      }
    })
    return unsub
  }, [])

  // Watch UI settings changes — font sizes
  useEffect(() => {
    let prevActive = useUISettingsStore.getState().activeFontSize
    let prevOther = useUISettingsStore.getState().otherFontSize
    const unsub = useUISettingsStore.subscribe((state) => {
      if (state.activeFontSize !== prevActive || state.otherFontSize !== prevOther) {
        prevActive = state.activeFontSize
        prevOther = state.otherFontSize
        broadcastRef.current('FONT_SIZE', {
          activeFontSize: state.activeFontSize,
          otherFontSize: state.otherFontSize,
        })
      }
    })
    return unsub
  }, [])

  // Watch titleFontSize
  useEffect(() => {
    let prev = useUISettingsStore.getState().titleFontSize
    const unsub = useUISettingsStore.subscribe((state) => {
      if (state.titleFontSize !== prev) {
        prev = state.titleFontSize
        broadcastRef.current('TITLE_FONT_SIZE', { titleFontSize: state.titleFontSize })
      }
    })
    return unsub
  }, [])

  // Watch colors
  useEffect(() => {
    let prevActive = useUISettingsStore.getState().activeColor
    let prevOther = useUISettingsStore.getState().otherColor
    let prevBg = useUISettingsStore.getState().lyricsBgColor
    const unsub = useUISettingsStore.subscribe((state) => {
      if (
        state.activeColor !== prevActive ||
        state.otherColor !== prevOther ||
        state.lyricsBgColor !== prevBg
      ) {
        prevActive = state.activeColor
        prevOther = state.otherColor
        prevBg = state.lyricsBgColor
        broadcastRef.current('LYRIC_COLORS', {
          activeColor: state.activeColor,
          otherColor: state.otherColor,
          lyricsBgColor: state.lyricsBgColor,
        })
      }
    })
    return unsub
  }, [])

  // Watch baseLineHeight
  useEffect(() => {
    let prev = useUISettingsStore.getState().baseLineHeight
    const unsub = useUISettingsStore.subscribe((state) => {
      if (state.baseLineHeight !== prev) {
        prev = state.baseLineHeight
        broadcastRef.current('LINE_HEIGHT', { baseLineHeight: state.baseLineHeight })
      }
    })
    return unsub
  }, [])

  // Watch visible range
  useEffect(() => {
    let prevBefore = useUISettingsStore.getState().visibleBefore
    let prevAfter = useUISettingsStore.getState().visibleAfter
    const unsub = useUISettingsStore.subscribe((state) => {
      if (state.visibleBefore !== prevBefore || state.visibleAfter !== prevAfter) {
        prevBefore = state.visibleBefore
        prevAfter = state.visibleAfter
        broadcastRef.current('VISIBLE_RANGE', {
          visibleBefore: state.visibleBefore,
          visibleAfter: state.visibleAfter,
        })
      }
    })
    return unsub
  }, [])
}
