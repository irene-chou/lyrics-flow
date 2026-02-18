import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { useSongStore } from '@/stores/useSongStore'
import { formatTime } from '@/lib/format'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface ManualTimerPanelProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function ManualTimerPanel({ engine }: ManualTimerPanelProps) {
  const isManualMode = usePlaybackStore((s) => s.isManualMode)
  const audioSource = useSongStore((s) => s.audioSource)
  const youtubeId = useSongStore((s) => s.youtubeId)
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const status = usePlaybackStore((s) => s.status)

  if (!isManualMode || audioSource !== 'youtube') return null

  function openYouTubeExternal() {
    if (youtubeId) {
      window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')
    }
  }

  const isPlaying = status === 'PLAYING'

  return (
    <div style={{ marginTop: '4px' }}>
      {/* Error message */}
      <div
        className="bg-lf-bg-input border border-lf-border"
        style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
        }}
      >
        <div
          className="text-lf-text-primary"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '4px',
          }}
        >
          此影片不允許嵌入播放
        </div>
        <p
          className="text-lf-text-secondary"
          style={{
            fontSize: '12px',
            lineHeight: 1.5,
            marginBottom: '8px',
          }}
        >
          請在其他視窗開啟 YouTube 播放伴奏，然後用下方計時器手動同步歌詞。
        </p>
        {youtubeId && (
          <button
            className="border border-lf-border bg-lf-bg-card text-lf-text-primary hover:bg-lf-bg-input hover:border-lf-text-dim transition-colors cursor-pointer"
            onClick={openYouTubeExternal}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            在新視窗開啟 YouTube
          </button>
        )}
      </div>

      {/* Manual Timer */}
      <div
        className="text-lf-text-dim"
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '8px',
        }}
      >
        手動計時器
      </div>
      <div
        className="flex items-center flex-wrap"
        style={{ gap: '8px' }}
      >
        <button
          className="border border-lf-accent bg-lf-accent text-white hover:bg-[#6b59de] hover:shadow-[0_4px_16px_var(--lf-accent-glow)] transition-all cursor-pointer"
          onClick={() => engine.manual.togglePlay()}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {isPlaying ? '⏸ 暫停' : '▶ 開始'}
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--lf-text-primary)',
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {formatTime(currentTime)}
        </span>
        <button
          className="border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer"
          onClick={() => engine.manual.seek(-5)}
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
          onClick={() => engine.manual.seek(5)}
          style={{
            padding: '6px 10px',
            fontSize: '11px',
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          +5s
        </button>
        <button
          className="border border-lf-border bg-lf-bg-input text-lf-danger hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer"
          onClick={() => engine.manual.reset()}
          style={{
            padding: '6px 10px',
            fontSize: '11px',
            borderRadius: '6px',
            fontFamily: 'var(--font-sans)',
          }}
        >
          重置
        </button>
      </div>
      <p
        className="text-lf-text-dim"
        style={{
          fontSize: '11px',
          marginTop: '6px',
          lineHeight: 1.5,
        }}
      >
        提示：在 YouTube 按播放的同時點「開始」，歌詞就會同步滾動。
      </p>
    </div>
  )
}
