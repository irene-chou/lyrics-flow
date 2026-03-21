import { useRef, useCallback, useEffect, useMemo } from 'react'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { useSongStore } from '@/stores/useSongStore'
import { PitchShifter } from 'soundtouchjs'

export function useLocalAudioPlayer() {
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const shifterRef = useRef<PitchShifter | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const savedPositionRef = useRef(0)
  const rafIdRef = useRef(0)
  const loadingRef = useRef<Promise<void> | null>(null)

  const stopTimeUpdatesRef = useRef(() => {})

  const startTimeUpdates = useCallback(() => {
    const update = () => {
      if (shifterRef.current) {
        const time = shifterRef.current.timePlayed
        const perc = shifterRef.current.percentagePlayed
        usePlaybackStore.getState().setCurrentTime(time)

        // Detect end-of-track via source position instead of relying on
        // PitchShifter's onEnd callback, which fires spuriously after
        // seek/recreate due to empty SoundTouch internal buffers.
        if (perc >= 99.9) {
          stopTimeUpdatesRef.current()
          usePlaybackStore.getState().setStatus('ENDED')
          savedPositionRef.current = 0
          return
        }
      }
      rafIdRef.current = requestAnimationFrame(update)
    }
    rafIdRef.current = requestAnimationFrame(update)
  }, [])

  const stopTimeUpdates = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
  }, [])

  // Keep ref in sync so the RAF loop can call stopTimeUpdates without stale closures
  stopTimeUpdatesRef.current = stopTimeUpdates

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    return audioCtxRef.current
  }, [])

  const destroyShifter = useCallback(() => {
    if (shifterRef.current) {
      shifterRef.current.disconnect()
      shifterRef.current = null
    }
  }, [])

  const createShifter = useCallback(() => {
    const ctx = audioCtxRef.current
    const buffer = audioBufferRef.current
    if (!ctx || !buffer) return false

    destroyShifter()

    // Ensure gain node exists
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain()
      gainNodeRef.current.connect(ctx.destination)
    }
    const { volume, muted } = usePlaybackStore.getState()
    gainNodeRef.current.gain.value = muted ? 0 : volume / 100

    const pitch = useSongStore.getState().pitch

    // Pass no-op for onEnd — SoundTouch fires it spuriously after seek/recreate
    // (empty internal buffers → extract returns 0 frames). End-of-track is
    // detected reliably in the RAF time-update loop via percentagePlayed instead.
    const shifter = new PitchShifter(ctx, buffer, 4096, () => {})
    shifter.pitchSemitones = pitch
    shifter.connect(gainNodeRef.current)
    shifterRef.current = shifter
    return true
  }, [destroyShifter])

  // Sync volume/muted from store to GainNode
  useEffect(() => {
    let prevVolume = usePlaybackStore.getState().volume
    let prevMuted = usePlaybackStore.getState().muted

    const unsub = usePlaybackStore.subscribe((state) => {
      if (state.volume === prevVolume && state.muted === prevMuted) return
      prevVolume = state.volume
      prevMuted = state.muted
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = state.muted ? 0 : state.volume / 100
      }
    })
    return unsub
  }, [])

  // Sync pitch from useSongStore to PitchShifter
  useEffect(() => {
    let prevPitch = useSongStore.getState().pitch

    const unsub = useSongStore.subscribe((state) => {
      if (state.pitch === prevPitch) return
      prevPitch = state.pitch
      if (shifterRef.current) {
        shifterRef.current.pitchSemitones = state.pitch
      }
    })
    return unsub
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdates()
      destroyShifter()
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
        gainNodeRef.current = null
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
        audioCtxRef.current = null
      }
    }
  }, [stopTimeUpdates, destroyShifter])

  const loadFile = useCallback((objectUrl: string) => {
    const ctx = ensureAudioContext()
    destroyShifter()
    stopTimeUpdates()
    savedPositionRef.current = 0

    // Store the loading promise so play() can await it
    loadingRef.current = (async () => {
      const response = await fetch(objectUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      audioBufferRef.current = audioBuffer

      usePlaybackStore.getState().setDuration(audioBuffer.duration)
      usePlaybackStore.getState().setCurrentTime(0)
      usePlaybackStore.getState().setStatus('IDLE')
    })()
  }, [ensureAudioContext, destroyShifter, stopTimeUpdates])

  const play = useCallback(async () => {
    // Wait for any pending file load to finish
    if (loadingRef.current) {
      await loadingRef.current
      loadingRef.current = null
    }

    const ctx = ensureAudioContext()

    // Always recreate shifter to avoid stale SoundTouch buffers that
    // cause spurious onEnd callbacks after pause/seek.
    const created = createShifter()
    if (!created) return // no buffer yet

    // Seek to saved position if resuming.
    // NOTE: percentagePlayed setter expects a 0–1 fraction, NOT 0–100.
    if (savedPositionRef.current > 0 && shifterRef.current && audioBufferRef.current) {
      shifterRef.current.percentagePlayed = savedPositionRef.current / audioBufferRef.current.duration
    }

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    startTimeUpdates()
    usePlaybackStore.getState().setStatus('PLAYING')
  }, [ensureAudioContext, createShifter, startTimeUpdates])

  const pause = useCallback(() => {
    if (shifterRef.current) {
      savedPositionRef.current = shifterRef.current.timePlayed
    }
    audioCtxRef.current?.suspend()
    stopTimeUpdates()
    usePlaybackStore.getState().setStatus('PAUSED')
  }, [stopTimeUpdates])

  const seekTo = useCallback((seconds: number) => {
    const buffer = audioBufferRef.current
    if (!buffer) return
    const clamped = Math.max(0, Math.min(buffer.duration, seconds))
    savedPositionRef.current = clamped
    usePlaybackStore.getState().setCurrentTime(clamped)

    // Always recreate shifter to flush stale SoundTouch internal buffers.
    // Without this, setting percentagePlayed on an existing shifter causes
    // the onEnd callback to fire spuriously (SoundTouch returns 0 frames).
    const status = usePlaybackStore.getState().status
    if (status === 'PLAYING' || status === 'PAUSED') {
      destroyShifter()
      createShifter()
      // NOTE: percentagePlayed setter expects a 0–1 fraction, NOT 0–100.
      if (shifterRef.current) {
        shifterRef.current.percentagePlayed = clamped / buffer.duration
      }
      // If paused, suspend context so new shifter doesn't start playing
      if (status === 'PAUSED') {
        audioCtxRef.current?.suspend()
      }
    }
  }, [destroyShifter, createShifter])

  const getCurrentTime = useCallback((): number => {
    if (shifterRef.current) {
      return shifterRef.current.timePlayed
    }
    return savedPositionRef.current
  }, [])

  const getDuration = useCallback((): number => {
    return audioBufferRef.current?.duration ?? 0
  }, [])

  return useMemo(
    () => ({
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
