import { useEffect } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { saveSongToDB, debouncedSaveSong } from '@/hooks/useSongLibrary'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface UseKeyboardShortcutsOptions {
  engine: ReturnType<typeof usePlaybackEngine>
  onCloseDrawer?: () => void
}

export function useKeyboardShortcuts({
  engine,
  onCloseDrawer,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement
      const tag = target.tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return
      if (target.contentEditable === 'true') return

      const isCmd = e.metaKey || e.ctrlKey

      switch (e.key) {
        case ' ': // Space — play/pause
          e.preventDefault()
          engine.togglePlay()
          break

        case 'Escape':
          onCloseDrawer?.()
          break

        case 'ArrowLeft': // Offset -
          e.preventDefault()
          {
            const delta = e.shiftKey ? -0.5 : -0.1
            const current = useSongStore.getState().offset
            const newOffset = Math.round((current + delta) * 10) / 10
            useSongStore.getState().setOffset(newOffset)
            useSyncStore.getState().setCurrentLineIndex(-1)
            debouncedSaveSong()
          }
          break

        case 'ArrowRight': // Offset +
          e.preventDefault()
          {
            const delta = e.shiftKey ? 0.5 : 0.1
            const current = useSongStore.getState().offset
            const newOffset = Math.round((current + delta) * 10) / 10
            useSongStore.getState().setOffset(newOffset)
            useSyncStore.getState().setCurrentLineIndex(-1)
            debouncedSaveSong()
          }
          break

        case 'ArrowUp': // Active font size +
          e.preventDefault()
          {
            const current = useUISettingsStore.getState().activeFontSize
            useUISettingsStore
              .getState()
              .setActiveFontSize(Math.min(60, current + 2))
          }
          break

        case 'ArrowDown': // Active font size -
          e.preventDefault()
          {
            const current = useUISettingsStore.getState().activeFontSize
            useUISettingsStore
              .getState()
              .setActiveFontSize(Math.max(14, current - 2))
          }
          break

        case 's':
        case 'S':
          if (isCmd) {
            e.preventDefault()
            // Save current song
            const song = useSongStore.getState()
            if (song.currentSongId) {
              saveSongToDB({
                id: song.currentSongId,
                name: song.currentSongTitle,
                lrcText: song.lrcText,
                offset: song.offset,
                audioSource: song.audioSource,
                youtubeId: song.youtubeId,
                audioFileName: song.audioFileName,
                createdAt: 0,
                updatedAt: Date.now(),
              })
              useSongStore.getState().captureState()
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [engine, onCloseDrawer])
}
