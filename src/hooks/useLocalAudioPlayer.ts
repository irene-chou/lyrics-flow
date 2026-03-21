import { useRef, useCallback, useEffect, useMemo } from 'react'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { PitchShifter } from 'soundtouchjs'

export function useLocalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const shifterRef = useRef<PitchShifter | null>(null)

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

      // Cleanup Web Audio nodes
      if (shifterRef.current) {
        shifterRef.current.disconnect()
        shifterRef.current = null
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect()
        sourceNodeRef.current = null
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [])

  // Sync volume/muted from store
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

  // Sync pitchSemitones from store to PitchShifter
  useEffect(() => {
    let prevPitch = usePlaybackStore.getState().pitchSemitones

    const unsub = usePlaybackStore.subscribe((state) => {
      if (state.pitchSemitones === prevPitch) return
      prevPitch = state.pitchSemitones
      if (shifterRef.current) {
        shifterRef.current.pitch = Math.pow(2, state.pitchSemitones / 12)
      }
    })
    return unsub
  }, [])

  /**
   * Initialize Web Audio API pipeline: AudioElement → MediaElementSource → PitchShifter → Destination
   * Must be called after a user gesture (for AudioContext policy) and only once per audio element.
   */
  const ensureAudioPipeline = useCallback(() => {
    const el = audioRef.current
    if (!el || sourceNodeRef.current) return // already initialized

    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const source = ctx.createMediaElementSource(el)
    sourceNodeRef.current = source

    const shifter = new PitchShifter(ctx, source, 4096)
    const currentPitch = usePlaybackStore.getState().pitchSemitones
    shifter.pitch = Math.pow(2, currentPitch / 12)
    shifterRef.current = shifter

    shifter.connect(ctx.destination)
  }, [])

  const loadFile = useCallback((objectUrl: string) => {
    const el = audioRef.current
    if (!el) return
    el.src = objectUrl
    el.load()
    usePlaybackStore.getState().setStatus('IDLE')
  }, [])

  const play = useCallback(() => {
    ensureAudioPipeline()
    const ctx = audioCtxRef.current
    if (ctx && ctx.state === 'suspended') {
      ctx.resume()
    }
    audioRef.current?.play()
  }, [ensureAudioPipeline])

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
