import { useEffect } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { VolumeControl } from './VolumeControl'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface LocalAudioPlayerProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function LocalAudioPlayer({ engine }: LocalAudioPlayerProps) {
  const audioSource = useSongStore((s) => s.audioSource)
  const audioFileObjectUrl = usePlaybackStore((s) => s.audioFileObjectUrl)
  const status = usePlaybackStore((s) => s.status)

  // Load audio file when URL changes
  useEffect(() => {
    if (audioSource === 'local' && audioFileObjectUrl) {
      engine.localAudio.loadFile(audioFileObjectUrl)
    }
  }, [audioFileObjectUrl, audioSource, engine.localAudio])

  if (audioSource !== 'local') return null

  const isPlaying = status === 'PLAYING'

  return (
    <div style={{ marginTop: '4px' }}>
      {!audioFileObjectUrl ? (
        <p
          className="text-lf-text-secondary"
          style={{
            fontSize: '12px',
            padding: '12px 0',
          }}
        >
          請重新選擇音檔以開始播放
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
            <button
              onClick={() => engine.togglePlay()}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid var(--lf-accent)',
                background: 'var(--lf-accent)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {isPlaying ? '⏸ 暫停' : '▶ 播放'}
            </button>
            <button
              onClick={() => engine.seekBy(-5)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid var(--lf-border)',
                background: 'var(--lf-bg-input)',
                color: 'var(--lf-text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              -5s
            </button>
            <button
              onClick={() => engine.seekBy(5)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid var(--lf-border)',
                background: 'var(--lf-bg-input)',
                color: 'var(--lf-text-primary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              +5s
            </button>
          </div>
          <VolumeControl />
        </div>
      )}
    </div>
  )
}
