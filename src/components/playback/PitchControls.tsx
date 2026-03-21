import { RotateCcw } from 'lucide-react'
import { useSongStore } from '@/stores/useSongStore'
import { debouncedSaveSong } from '@/hooks/useSongLibrary'
import { CONTROL_BTN_CLASS, OFFSET_BTN_STYLE } from '@/lib/constants'

export function PitchControls() {
  const currentSongId = useSongStore((s) => s.currentSongId)
  const audioSource = useSongStore((s) => s.audioSource)
  const pitch = useSongStore((s) => s.pitch)

  // Only show for local audio (YouTube doesn't support pitch shifting)
  if (!currentSongId || audioSource !== 'local') return null

  function adjustPitch(delta: number) {
    const current = useSongStore.getState().pitch
    const newPitch = Math.round((current + delta) * 2) / 2 // round to 0.5
    const clamped = Math.max(-12, Math.min(12, newPitch))
    useSongStore.getState().setPitch(clamped)
    debouncedSaveSong()
  }

  function resetPitch() {
    useSongStore.getState().setPitch(0)
    debouncedSaveSong()
  }

  return (
    <div style={{ marginTop: '4px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div
          className="text-lb-text-dim"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          升降 Key (Pitch)
        </div>
        <button
          className="flex text-lb-text-secondary hover:text-lb-text-primary hover:bg-lb-bg-input transition-colors cursor-pointer"
          onClick={resetPitch}
          title="重置 Key"
          style={{
            padding: '4px',
            borderRadius: '4px',
            background: 'none',
            borderStyle: 'none',
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="flex items-center justify-center" style={{ gap: '6px' }}>
        <button className={CONTROL_BTN_CLASS} onClick={() => adjustPitch(-1)} style={OFFSET_BTN_STYLE}>
          -1
        </button>
        <button className={CONTROL_BTN_CLASS} onClick={() => adjustPitch(-0.5)} style={OFFSET_BTN_STYLE}>
          -½
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--lb-text-primary)',
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {pitch >= 0 ? '+' : ''}
          {pitch % 1 === 0 ? pitch.toFixed(0) : pitch.toFixed(1)}
        </span>
        <button className={CONTROL_BTN_CLASS} onClick={() => adjustPitch(0.5)} style={OFFSET_BTN_STYLE}>
          +½
        </button>
        <button className={CONTROL_BTN_CLASS} onClick={() => adjustPitch(1)} style={OFFSET_BTN_STYLE}>
          +1
        </button>
      </div>
    </div>
  )
}
