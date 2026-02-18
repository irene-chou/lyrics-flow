import { RotateCcw } from 'lucide-react'
import { useSongStore } from '@/stores/useSongStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { debouncedSaveSong } from '@/hooks/useSongLibrary'

export function OffsetControls() {
  const { currentSongId, offset } = useSongStore()

  if (!currentSongId) return null

  function adjustOffset(delta: number) {
    const newOffset = Math.round((offset + delta) * 10) / 10
    useSongStore.getState().setOffset(newOffset)
    useSyncStore.getState().setCurrentLineIndex(-1)
    debouncedSaveSong()
  }

  function resetOffset() {
    useSongStore.getState().setOffset(0)
    useSyncStore.getState().setCurrentLineIndex(-1)
    debouncedSaveSong()
  }

  const btnClass = 'border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer'

  const btnStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '11px',
    borderRadius: '6px',
    fontFamily: 'var(--font-sans)',
  }

  return (
    <div style={{ marginTop: '4px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div
          className="text-lf-text-dim"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          歌詞偏移 (Offset)
        </div>
        <button
          className="flex text-lf-text-secondary hover:text-lf-text-primary hover:bg-lf-bg-input transition-colors cursor-pointer"
          onClick={resetOffset}
          title="重置偏移"
          style={{
            padding: '4px',
            borderRadius: '4px',
            background: 'none',
            border: 'none',
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="flex items-center justify-center" style={{ gap: '6px' }}>
        <button className={btnClass} onClick={() => adjustOffset(-0.5)} style={btnStyle}>
          -0.5s
        </button>
        <button className={btnClass} onClick={() => adjustOffset(-0.1)} style={btnStyle}>
          -0.1s
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--lf-text-primary)',
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {offset >= 0 ? '+' : ''}
          {offset.toFixed(1)}s
        </span>
        <button className={btnClass} onClick={() => adjustOffset(0.1)} style={btnStyle}>
          +0.1s
        </button>
        <button className={btnClass} onClick={() => adjustOffset(0.5)} style={btnStyle}>
          +0.5s
        </button>
      </div>
    </div>
  )
}
