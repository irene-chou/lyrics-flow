import { useEffect } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface YouTubePlayerProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function YouTubePlayer({ engine }: YouTubePlayerProps) {
  const youtubeId = useSongStore((s) => s.youtubeId)
  const audioSource = useSongStore((s) => s.audioSource)
  const isManualMode = usePlaybackStore((s) => s.isManualMode)

  // Load video when youtubeId changes
  useEffect(() => {
    if (audioSource === 'youtube' && youtubeId && !isManualMode) {
      engine.youtube.loadVideo(youtubeId)
    }
  }, [youtubeId, audioSource, isManualMode, engine.youtube])

  if (audioSource !== 'youtube' || isManualMode) return null

  return (
    <div
      style={{
        marginTop: '4px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9
          height: 0,
          overflow: 'hidden',
          background: '#000',
          borderRadius: '8px',
        }}
      >
        <div
          ref={engine.youtube.containerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  )
}
