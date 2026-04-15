import { useRef, useCallback, useEffect, useMemo } from 'react'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { useSongStore } from '@/stores/useSongStore'
import { PitchShifter } from 'soundtouchjs'

export function useLocalAudioPlayer() {
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const savedPositionRef = useRef(0)
  const rafIdRef = useRef(0)
  const loadingRef = useRef<Promise<void> | null>(null)

  // PitchShifter path (pitch !== 0)
  const shifterRef = useRef<PitchShifter | null>(null)

  // Direct AudioBufferSourceNode path (pitch === 0) — bypasses SoundTouch entirely
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const startContextTimeRef = useRef(0)
  const startOffsetRef = useRef(0)

  const stopTimeUpdatesRef = useRef(() => {})

  const stopTimeUpdates = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
  }, [])

  // Keep ref in sync so the RAF loop can call stopTimeUpdates without stale closures
  stopTimeUpdatesRef.current = stopTimeUpdates

  const startTimeUpdates = useCallback(() => {
    const update = () => {
      const buffer = audioBufferRef.current
      if (!buffer) return

      if (sourceNodeRef.current) {
        // Direct mode: compute position from AudioContext clock
        const ctx = audioCtxRef.current
        if (!ctx) return
        const time = startOffsetRef.current + (ctx.currentTime - startContextTimeRef.current)
        usePlaybackStore.getState().setCurrentTime(time)
        if (time >= buffer.duration) {
          stopTimeUpdatesRef.current()
          try { sourceNodeRef.current.stop() } catch { /* already stopped */ }
          sourceNodeRef.current = null
          savedPositionRef.current = 0
          usePlaybackStore.getState().setStatus('ENDED')
          return
        }
      } else if (shifterRef.current) {
        // PitchShifter mode
        const time = shifterRef.current.timePlayed
        const perc = shifterRef.current.percentagePlayed
        usePlaybackStore.getState().setCurrentTime(time)

        // Detect end-of-track via source position instead of relying on
        // PitchShifter's onEnd callback, which fires spuriously after
        // seek/recreate due to empty SoundTouch internal buffers.
        if (perc >= 99.9) {
          stopTimeUpdatesRef.current()
          savedPositionRef.current = 0
          usePlaybackStore.getState().setStatus('ENDED')
          return
        }
      } else {
        return
      }
      rafIdRef.current = requestAnimationFrame(update)
    }
    rafIdRef.current = requestAnimationFrame(update)
  }, [])

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

  const destroySourceNode = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop() } catch { /* already stopped */ }
      sourceNodeRef.current.disconnect()
      sourceNodeRef.current = null
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

  const createSourceNode = useCallback((offset: number) => {
    const ctx = audioCtxRef.current
    const buffer = audioBufferRef.current
    if (!ctx || !buffer) return false

    destroySourceNode()

    // Ensure gain node exists
    if (!gainNodeRef.current) {
      gainNodeRef.current = ctx.createGain()
      gainNodeRef.current.connect(ctx.destination)
    }
    const { volume, muted } = usePlaybackStore.getState()
    gainNodeRef.current.gain.value = muted ? 0 : volume / 100

    const clampedOffset = Math.max(0, Math.min(buffer.duration, offset))
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(gainNodeRef.current)
    source.start(0, clampedOffset)
    sourceNodeRef.current = source
    startContextTimeRef.current = ctx.currentTime
    startOffsetRef.current = clampedOffset
    return true
  }, [destroySourceNode])

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

  // Sync pitch changes — switch playback mode between direct and PitchShifter
  useEffect(() => {
    let prevPitch = useSongStore.getState().pitch

    const unsub = useSongStore.subscribe((state) => {
      if (state.pitch === prevPitch) return
      prevPitch = state.pitch

      const status = usePlaybackStore.getState().status
      const isPlaying = status === 'PLAYING'
      const isPaused = status === 'PAUSED'
      if (!isPlaying && !isPaused) return

      // Capture current position before teardown
      if (sourceNodeRef.current) {
        const ctx = audioCtxRef.current
        if (ctx) {
          savedPositionRef.current = startOffsetRef.current + (ctx.currentTime - startContextTimeRef.current)
        }
      } else if (shifterRef.current) {
        savedPositionRef.current = shifterRef.current.timePlayed
      }

      stopTimeUpdates()
      destroySourceNode()
      destroyShifter()

      // When paused, just save position — play() will set up the correct source
      // for the new pitch value when the user resumes.
      if (isPaused) return

      // Rebuild source for the new pitch value while playing
      if (state.pitch === 0) {
        createSourceNode(savedPositionRef.current)
      } else {
        createShifter()
        if (shifterRef.current && audioBufferRef.current) {
          shifterRef.current.percentagePlayed = savedPositionRef.current / audioBufferRef.current.duration
        }
      }
      startTimeUpdates()
    })
    return unsub
  }, [stopTimeUpdates, destroySourceNode, destroyShifter, createSourceNode, createShifter, startTimeUpdates])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdates()
      destroySourceNode()
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
  }, [stopTimeUpdates, destroySourceNode, destroyShifter])

  const loadFile = useCallback((objectUrl: string) => {
    const ctx = ensureAudioContext()
    destroySourceNode()
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
  }, [ensureAudioContext, destroySourceNode, destroyShifter, stopTimeUpdates])

  const play = useCallback(async () => {
    // Wait for any pending file load to finish
    if (loadingRef.current) {
      await loadingRef.current
      loadingRef.current = null
    }

    const ctx = ensureAudioContext()
    const pitch = useSongStore.getState().pitch

    let created: boolean
    if (pitch === 0) {
      // Direct mode: bypass SoundTouch entirely to avoid WSOLA artifacts
      created = createSourceNode(savedPositionRef.current)
    } else {
      // Always recreate shifter to avoid stale SoundTouch buffers that
      // cause spurious onEnd callbacks after pause/seek.
      created = createShifter()
      if (created && savedPositionRef.current > 0 && shifterRef.current && audioBufferRef.current) {
        // NOTE: percentagePlayed setter expects a 0–1 fraction, NOT 0–100.
        shifterRef.current.percentagePlayed = savedPositionRef.current / audioBufferRef.current.duration
      }
    }

    if (!created) return // no buffer yet

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    startTimeUpdates()
    usePlaybackStore.getState().setStatus('PLAYING')
  }, [ensureAudioContext, createSourceNode, createShifter, startTimeUpdates])

  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      // Direct mode: save current position from AudioContext clock before stopping
      const ctx = audioCtxRef.current
      if (ctx) {
        savedPositionRef.current = startOffsetRef.current + (ctx.currentTime - startContextTimeRef.current)
      }
      try { sourceNodeRef.current.stop() } catch { /* already stopped */ }
      sourceNodeRef.current = null
    } else if (shifterRef.current) {
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

    const status = usePlaybackStore.getState().status
    if (status !== 'PLAYING' && status !== 'PAUSED') return

    const pitch = useSongStore.getState().pitch

    if (pitch === 0) {
      // Recreate source at new position; time-update RAF continues seamlessly
      createSourceNode(clamped)
      if (status === 'PAUSED') audioCtxRef.current?.suspend()
    } else {
      // Always recreate shifter to flush stale SoundTouch internal buffers.
      // Without this, setting percentagePlayed on an existing shifter causes
      // the onEnd callback to fire spuriously (SoundTouch returns 0 frames).
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
  }, [createSourceNode, destroyShifter, createShifter])

  const getCurrentTime = useCallback((): number => {
    if (sourceNodeRef.current) {
      const ctx = audioCtxRef.current
      if (ctx) {
        return startOffsetRef.current + (ctx.currentTime - startContextTimeRef.current)
      }
    }
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
