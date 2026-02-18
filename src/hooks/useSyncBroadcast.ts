import { useEffect, useRef } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import type { SyncMessageType } from '@/types'

interface UseSyncBroadcastOptions {
  broadcast: (type: SyncMessageType, data: Record<string, unknown>) => void
}

/**
 * Generic store watcher: subscribes to a Zustand store and broadcasts
 * when selected fields change.
 */
function useStoreWatcher<T>(
  store: { getState: () => T; subscribe: (cb: (state: T) => void) => () => void },
  selector: (state: T) => Record<string, unknown>,
  messageType: SyncMessageType,
  broadcastRef: React.RefObject<(type: SyncMessageType, data: Record<string, unknown>) => void>,
) {
  useEffect(() => {
    let prev = selector(store.getState())
    const unsub = store.subscribe((state) => {
      const next = selector(state)
      const changed = Object.keys(next).some(
        (k) => next[k] !== prev[k],
      )
      if (changed) {
        prev = next
        broadcastRef.current(messageType, next)
      }
    })
    return unsub
  }, [store, selector, messageType, broadcastRef])
}

export function useSyncBroadcast({ broadcast }: UseSyncBroadcastOptions) {
  const broadcastRef = useRef(broadcast)
  broadcastRef.current = broadcast

  useStoreWatcher(
    useSyncStore,
    (s) => ({ currentLineIndex: s.currentLineIndex }),
    'SYNC_UPDATE',
    broadcastRef,
  )

  useStoreWatcher(
    useSongStore,
    (s) => ({ lyrics: s.lyrics, songTitle: s.currentSongTitle }),
    'LYRICS_LOADED',
    broadcastRef,
  )

  useStoreWatcher(
    useSongStore,
    (s) => ({ offset: s.offset }),
    'OFFSET',
    broadcastRef,
  )

  useStoreWatcher(
    useUISettingsStore,
    (s) => ({ activeFontSize: s.activeFontSize, otherFontSize: s.otherFontSize }),
    'FONT_SIZE',
    broadcastRef,
  )

  useStoreWatcher(
    useUISettingsStore,
    (s) => ({ titleFontSize: s.titleFontSize, showTitle: s.showTitle }),
    'TITLE_FONT_SIZE',
    broadcastRef,
  )

  useStoreWatcher(
    useUISettingsStore,
    (s) => ({ activeColor: s.activeColor, otherColor: s.otherColor, lyricsBgColor: s.lyricsBgColor }),
    'LYRIC_COLORS',
    broadcastRef,
  )

  useStoreWatcher(
    useUISettingsStore,
    (s) => ({ baseLineHeight: s.baseLineHeight }),
    'LINE_HEIGHT',
    broadcastRef,
  )

  useStoreWatcher(
    useUISettingsStore,
    (s) => ({ visibleBefore: s.visibleBefore, visibleAfter: s.visibleAfter }),
    'VISIBLE_RANGE',
    broadcastRef,
  )
}
