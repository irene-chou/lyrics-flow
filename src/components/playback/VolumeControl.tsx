import { Volume2, VolumeX } from 'lucide-react'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { useRef } from 'react'

export function VolumeControl() {
  const volume = usePlaybackStore((s) => s.volume)
  const muted = usePlaybackStore((s) => s.muted)
  const volumeBeforeMute = useRef(100)

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    usePlaybackStore.getState().setVolume(val)
    if (val > 0 && muted) {
      usePlaybackStore.getState().setMuted(false)
    }
    volumeBeforeMute.current = val
  }

  function handleToggleMute() {
    if (muted) {
      usePlaybackStore.getState().setMuted(false)
      if (volume === 0) {
        usePlaybackStore.getState().setVolume(volumeBeforeMute.current || 100)
      }
    } else {
      volumeBeforeMute.current = volume
      usePlaybackStore.getState().setMuted(true)
    }
  }

  const displayVolume = muted ? 0 : volume

  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <button
        className="flex text-lf-text-secondary hover:text-lf-text-primary hover:bg-lf-bg-input transition-colors cursor-pointer"
        onClick={handleToggleMute}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          borderRadius: '4px',
        }}
        title="靜音"
      >
        {muted || volume === 0 ? (
          <VolumeX size={16} />
        ) : (
          <Volume2 size={16} />
        )}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={displayVolume}
        onChange={handleVolumeChange}
        style={{
          flex: 1,
          height: '4px',
          appearance: 'none',
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--lf-accent) ${displayVolume}%, var(--lf-bg-input) ${displayVolume}%)`,
          borderRadius: '2px',
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  )
}
