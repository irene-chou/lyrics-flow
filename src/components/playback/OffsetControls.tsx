import { RotateCcw, Save } from 'lucide-react'
import { useSongStore } from '@/stores/useSongStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { saveSongToDB } from '@/hooks/useSongLibrary'

export function OffsetControls() {
  const { currentSongId, currentSongTitle, offset, lrcText, audioSource, youtubeId, audioFileName, lastSavedState } =
    useSongStore()

  if (!currentSongId) return null

  function adjustOffset(delta: number) {
    const newOffset = Math.round((offset + delta) * 10) / 10
    useSongStore.getState().setOffset(newOffset)
    // Reset sync to force re-evaluation
    useSyncStore.getState().setCurrentLineIndex(-1)
  }

  function resetOffset() {
    if (lastSavedState) {
      useSongStore.getState().setOffset(lastSavedState.offset)
      useSyncStore.getState().setCurrentLineIndex(-1)
    }
  }

  async function saveOffset() {
    if (!currentSongId) return
    const song = {
      id: currentSongId,
      name: currentSongTitle,
      lrcText,
      offset,
      audioSource,
      youtubeId,
      audioFileName,
      createdAt: 0, // will be preserved by put
      updatedAt: Date.now(),
    }
    await saveSongToDB(song)
    useSongStore.getState().captureState()
  }

  const offsetChanged = lastSavedState ? offset !== lastSavedState.offset : false

  const btnStyle: React.CSSProperties = {
    padding: '6px 10px',
    fontSize: '11px',
    borderRadius: '6px',
    border: '1px solid var(--lf-border)',
    background: 'var(--lf-bg-input)',
    color: 'var(--lf-text-primary)',
    cursor: 'pointer',
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
        <div className="flex items-center" style={{ gap: '4px' }}>
          <button
            onClick={resetOffset}
            title="重置偏移"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: 'var(--lf-text-secondary)',
              display: 'flex',
              borderRadius: '4px',
            }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={saveOffset}
            title="儲存偏移"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: offsetChanged ? 'var(--lf-accent)' : 'var(--lf-text-secondary)',
              display: 'flex',
              borderRadius: '4px',
            }}
          >
            <Save size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center" style={{ gap: '6px' }}>
        <button onClick={() => adjustOffset(-0.5)} style={btnStyle}>
          -0.5s
        </button>
        <button onClick={() => adjustOffset(-0.1)} style={btnStyle}>
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
        <button onClick={() => adjustOffset(0.1)} style={btnStyle}>
          +0.1s
        </button>
        <button onClick={() => adjustOffset(0.5)} style={btnStyle}>
          +0.5s
        </button>
      </div>
    </div>
  )
}
