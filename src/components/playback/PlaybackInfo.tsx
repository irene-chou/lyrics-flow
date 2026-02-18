import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { formatTime } from '@/lib/format'

interface PlaybackInfoProps {
  onSeek?: (time: number) => void
}

export function PlaybackInfo({ onSeek }: PlaybackInfoProps) {
  const status = usePlaybackStore((s) => s.status)
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)

  if (status === 'IDLE' && duration === 0) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const dotColor =
    status === 'PLAYING'
      ? 'var(--lf-success)'
      : status === 'PAUSED'
        ? '#eab308'
        : 'var(--lf-text-dim)'

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSeek || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    onSeek(ratio * duration)
  }

  return (
    <div className="flex items-center" style={{ gap: '8px', marginTop: '8px' }}>
      {/* Status dot */}
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />

      {/* Time display */}
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--lf-text-secondary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Progress bar */}
      <div
        onClick={handleBarClick}
        style={{
          flex: 1,
          height: '4px',
          background: 'var(--lf-bg-input)',
          borderRadius: '2px',
          cursor: onSeek ? 'pointer' : 'default',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, progress)}%`,
            height: '100%',
            background: 'var(--lf-accent)',
            borderRadius: '2px',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  )
}
