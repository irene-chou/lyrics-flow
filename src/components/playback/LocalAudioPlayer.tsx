import { useEffect, useRef, useCallback } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { VolumeControl } from './VolumeControl'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface LocalAudioPlayerProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function LocalAudioPlayer({ engine }: LocalAudioPlayerProps) {
  const audioSource = useSongStore((s) => s.audioSource)
  const audioFileName = useSongStore((s) => s.audioFileName)
  const audioFileObjectUrl = usePlaybackStore((s) => s.audioFileObjectUrl)
  const status = usePlaybackStore((s) => s.status)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load audio file when URL changes
  useEffect(() => {
    if (audioSource === 'local' && audioFileObjectUrl) {
      engine.localAudio.loadFile(audioFileObjectUrl)
    }
  }, [audioFileObjectUrl, audioSource, engine.localAudio])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    usePlaybackStore.getState().setAudioFileObjectUrl(objectUrl)
    // Update file name in song store if it differs
    if (file.name !== audioFileName) {
      useSongStore.getState().setAudioFileName(file.name)
    }
    // Reset input so re-selecting same file triggers change
    e.target.value = ''
  }, [audioFileName])

  if (audioSource !== 'local') return null

  const isPlaying = status === 'PLAYING'

  return (
    <div style={{ marginTop: '4px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {!audioFileObjectUrl ? (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <p
            className="text-lf-text-secondary"
            style={{
              fontSize: '12px',
            }}
          >
            {audioFileName
              ? `上次使用：${audioFileName}`
              : '請選擇音檔以開始播放'}
          </p>
          <button
            className="border border-lf-accent bg-lf-accent text-white hover:bg-[#6b59de] hover:shadow-[0_4px_16px_var(--lf-accent-glow)] transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              fontFamily: 'var(--font-sans)',
              alignSelf: 'flex-start',
            }}
          >
            選擇音檔
          </button>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
            <button
              className="border border-lf-accent bg-lf-accent text-white hover:bg-[#6b59de] hover:shadow-[0_4px_16px_var(--lf-accent-glow)] transition-all cursor-pointer"
              onClick={() => engine.togglePlay()}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {isPlaying ? '⏸ 暫停' : '▶ 播放'}
            </button>
            <button
              className="border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer"
              onClick={() => engine.seekBy(-5)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              -5s
            </button>
            <button
              className="border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer"
              onClick={() => engine.seekBy(5)}
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                borderRadius: '6px',
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
