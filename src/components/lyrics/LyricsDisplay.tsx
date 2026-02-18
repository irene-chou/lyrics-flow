import { useSongStore } from '@/stores/useSongStore'
import { EmptyState } from './EmptyState'
import { LyricsContainer } from './LyricsContainer'

interface LyricsDisplayProps {
  onSeekToLyric?: (time: number) => void
}

export function LyricsDisplay({ onSeekToLyric }: LyricsDisplayProps) {
  const currentSongId = useSongStore((s) => s.currentSongId)

  return (
    <main
      className="relative flex-1 overflow-hidden flex flex-col"
      style={{ background: 'var(--lf-bg-primary)' }}
    >
      {currentSongId ? (
        <LyricsContainer onSeekToLyric={onSeekToLyric} />
      ) : (
        <EmptyState />
      )}
    </main>
  )
}
