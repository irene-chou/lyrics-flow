import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { formatTime } from '@/lib/format'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface ManualTimerPanelProps {
  engine: ReturnType<typeof usePlaybackEngine>
}

export function ManualTimerPanel({ engine }: ManualTimerPanelProps) {
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const status = usePlaybackStore((s) => s.status)

  const isPlaying = status === 'PLAYING'

  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      {/* Header */}
      <div
        className="text-lb-text-dim"
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        手動計時器
      </div>
      <div
        className="flex items-center flex-wrap"
        style={{ gap: '8px' }}
      >
        <button
          className="border border-lb-accent bg-lb-accent text-white hover:bg-[#6b59de] hover:shadow-[0_4px_16px_var(--lb-accent-glow)] transition-all cursor-pointer"
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
            color: 'var(--lb-text-primary)',
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {formatTime(currentTime)}
        </span>
        <button
          className="border border-lb-border bg-lb-bg-input text-lb-text-primary hover:bg-lb-bg-card hover:border-lb-text-dim transition-colors cursor-pointer"
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
          className="border border-lb-border bg-lb-bg-input text-lb-text-primary hover:bg-lb-bg-card hover:border-lb-text-dim transition-colors cursor-pointer"
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
          className="border border-lb-border bg-lb-bg-input text-lb-danger hover:bg-lb-bg-card hover:border-lb-text-dim transition-colors cursor-pointer"
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
        className="text-lb-text-dim"
        style={{
          fontSize: '11px',
          lineHeight: 1.5,
        }}
      >
        沒有音源時，可用計時器手動同步歌詞滾動。
      </p>
    </div>
  )
}
