import { useSongStore } from '@/stores/useSongStore'
import { EmptyState } from './EmptyState'
import { LyricsContainer } from './LyricsContainer'

interface LyricsDisplayProps {
  onSeekToLyric?: (time: number) => void
  isMobile?: boolean
}

export function LyricsDisplay({ onSeekToLyric, isMobile }: LyricsDisplayProps) {
  const currentSongId = useSongStore((s) => s.currentSongId)

  return (
    <main
      className="relative flex-1 overflow-hidden flex flex-col bg-lf-bg-primary"
    >
      {currentSongId ? (
        <LyricsContainer onSeekToLyric={onSeekToLyric} isMobile={isMobile} />
      ) : (
        <EmptyState isMobile={isMobile} />
      )}
    </main>
  )
}
