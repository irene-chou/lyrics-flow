import { useEffect } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface YouTubePlayerProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function YouTubePlayer({ engine }: YouTubePlayerProps) {
  const youtubeId = useSongStore((s) => s.youtubeId)
  const audioSource = useSongStore((s) => s.audioSource)

  // Load video when youtubeId changes
  useEffect(() => {
    if (audioSource === 'youtube' && youtubeId) {
      engine.youtube.loadVideo(youtubeId)
    }
  }, [youtubeId, audioSource, engine.youtube])

  if (audioSource !== 'youtube') return null

  return (
    <div
      style={{
        position: 'relative',
        paddingBottom: '56.25%', // 16:9
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#000',
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
  )
}
