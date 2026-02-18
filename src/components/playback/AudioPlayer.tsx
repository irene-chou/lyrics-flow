import { useEffect, useRef, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { YouTubePlayer } from './YouTubePlayer'
import { ManualTimerPanel } from './ManualTimerPanel'
import { PlaybackInfo } from './PlaybackInfo'
import { VolumeControl } from './VolumeControl'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface AudioPlayerProps {
  engine: ReturnType<typeof usePlaybackEngine>
  onSeek: (time: number) => void
}

export function AudioPlayer({ engine, onSeek }: AudioPlayerProps) {
  const audioSource = useSongStore((s) => s.audioSource)
  const audioFileName = useSongStore((s) => s.audioFileName)
  const audioFileObjectUrl = usePlaybackStore((s) => s.audioFileObjectUrl)
  const isManualMode = usePlaybackStore((s) => s.isManualMode)
  const status = usePlaybackStore((s) => s.status)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load local audio file when URL changes
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
    if (file.name !== audioFileName) {
      useSongStore.getState().setAudioFileName(file.name)
    }
    e.target.value = ''
  }, [audioFileName])

  const isPlaying = status === 'PLAYING'

  // Local audio — no file loaded yet: show prompt without player container
  if (audioSource === 'local' && !audioFileObjectUrl) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <p
            className="text-lf-text-secondary"
            style={{ fontSize: '12px' }}
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
      </div>
    )
  }

  return (
    <div
      className="flex flex-col bg-lf-bg-input rounded-lg"
      style={{ gap: '6px', padding: '10px 12px' }}
    >
      {/* YouTube embed mode */}
      {audioSource === 'youtube' && !isManualMode && (
        <>
          <YouTubePlayer engine={engine} />
          <PlaybackInfo onSeek={onSeek} />
        </>
      )}

      {/* YouTube manual timer mode */}
      {audioSource === 'youtube' && isManualMode && (
        <ManualTimerPanel engine={engine} />
      )}

      {/* Local audio — file loaded */}
      {audioSource === 'local' && audioFileObjectUrl && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <PlaybackInfo onSeek={onSeek} />
          <div className="flex items-center justify-between" style={{ gap: '6px' }}>
            <button
              className="flex items-center justify-center border border-lf-accent bg-lf-accent text-white hover:bg-[#6b59de] hover:shadow-[0_4px_16px_var(--lf-accent-glow)] transition-all cursor-pointer"
              onClick={() => engine.togglePlay()}
              style={{
                width: '26px',
                height: '26px',
                padding: 0,
                borderRadius: '50%',
                flexShrink: 0,
              }}
              title={isPlaying ? '暫停' : '播放'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
            </button>
            <VolumeControl />
          </div>
        </>
      )}
    </div>
  )
}
