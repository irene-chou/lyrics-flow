import { useEffect, useRef, useCallback, useState } from 'react'
import {
  getSessionId,
  getChannelName,
  PIESOCKET_API_KEY,
  PIESOCKET_CLUSTER_ID,
} from '@/lib/piesocket'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import type { SyncMessageType } from '@/types'

export function useOBSSync() {
  const channelRef = useRef<{ publish: (event: string, data: unknown) => void } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const sessionId = getSessionId()

  // Initialize PieSocket connection
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PieSocket) {
      console.warn('PieSocket not loaded. OBS sync disabled.')
      return
    }

    const channelName = getChannelName()

    const ps = new window.PieSocket.default({
      clusterId: PIESOCKET_CLUSTER_ID,
      apiKey: PIESOCKET_API_KEY,
      notifySelf: 0,
    })

    ps.subscribe(channelName).then((ch) => {
      channelRef.current = ch
      setIsConnected(true)

      ch.listen('sync', (msg: { type: string }) => {
        if (msg.type === 'REQUEST_STATE') {
          broadcastFullState()
        }
      })

      console.log('PieSocket connected:', channelName)
    })

    return () => {
      channelRef.current = null
      setIsConnected(false)
    }
  }, [])

  const broadcast = useCallback(
    (type: SyncMessageType, data: Record<string, unknown>) => {
      if (!channelRef.current) return
      try {
        channelRef.current.publish('sync', { type, data })
      } catch {
        // ignore broadcast errors
      }
    },
    [],
  )

  const broadcastFullState = useCallback(() => {
    const song = useSongStore.getState()
    const ui = useUISettingsStore.getState()
    const sync = useSyncStore.getState()

    broadcast('FULL_STATE', {
      lyrics: song.lyrics,
      currentLineIndex: sync.currentLineIndex,
      activeFontSize: ui.activeFontSize,
      otherFontSize: ui.otherFontSize,
      baseLineHeight: ui.baseLineHeight,
      titleFontSize: ui.titleFontSize,
      visibleBefore: ui.visibleBefore,
      visibleAfter: ui.visibleAfter,
      offset: song.offset,
      activeColor: ui.activeColor,
      otherColor: ui.otherColor,
      lyricsBgColor: ui.lyricsBgColor,
      songTitle: song.currentSongTitle,
    })
  }, [broadcast])

  // Auto-broadcast on tab visibility change
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        broadcastFullState()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [broadcastFullState])

  return { broadcast, broadcastFullState, isConnected, sessionId }
}
