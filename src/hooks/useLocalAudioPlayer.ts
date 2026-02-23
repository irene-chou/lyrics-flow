import { useRef, useCallback, useEffect, useMemo } from 'react'
import { usePlaybackStore } from '@/stores/usePlaybackStore'

export function useLocalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio element once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const el = audioRef.current

    const onPlay = () => usePlaybackStore.getState().setStatus('PLAYING')
    const onPause = () => usePlaybackStore.getState().setStatus('PAUSED')
    const onEnded = () => usePlaybackStore.getState().setStatus('ENDED')
    const onTimeUpdate = () => {
      if (el) {
        usePlaybackStore.getState().setCurrentTime(el.currentTime)
      }
    }
    const onDurationChange = () => {
      if (el && !isNaN(el.duration)) {
        usePlaybackStore.getState().setDuration(el.duration)
      }
    }
    const onLoadedMetadata = () => {
      if (el && !isNaN(el.duration)) {
        usePlaybackStore.getState().setDuration(el.duration)
      }
    }

    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('loadedmetadata', onLoadedMetadata)

    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('loadedmetadata', onLoadedMetadata)
      el.pause()
      el.src = ''
    }
  }, [])

  // Sync volume/muted from store (with guard to skip no-op writes)
  useEffect(() => {
    let prevVolume = usePlaybackStore.getState().volume
    let prevMuted = usePlaybackStore.getState().muted

    const unsub = usePlaybackStore.subscribe((state) => {
      if (state.volume === prevVolume && state.muted === prevMuted) return
      prevVolume = state.volume
      prevMuted = state.muted
      const el = audioRef.current
      if (!el) return
      el.volume = state.muted ? 0 : state.volume / 100
    })
    return unsub
  }, [])

  const loadFile = useCallback((objectUrl: string) => {
    const el = audioRef.current
    if (!el) return
    el.src = objectUrl
    el.load()
    usePlaybackStore.getState().setStatus('IDLE')
  }, [])

  const play = useCallback(() => {
    audioRef.current?.play()
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const seekTo = useCallback((seconds: number) => {
    const el = audioRef.current
    if (!el) return
    const duration = el.duration || 0
    el.currentTime = Math.max(0, Math.min(duration, seconds))
  }, [])

  const getCurrentTime = useCallback((): number => {
    return audioRef.current?.currentTime ?? 0
  }, [])

  const getDuration = useCallback((): number => {
    return audioRef.current?.duration ?? 0
  }, [])

  return useMemo(
    () => ({
      audioRef,
      loadFile,
      play,
      pause,
      seekTo,
      getCurrentTime,
      getDuration,
    }),
    [loadFile, play, pause, seekTo, getCurrentTime, getDuration],
  )
}
