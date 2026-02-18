import { useRef, useEffect, useCallback } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { NowSinging } from './NowSinging'
import { LyricLine } from './LyricLine'
import type { LyricStatus } from './LyricLine'

interface LyricsContainerProps {
  onSeekToLyric?: (time: number) => void
}

export function LyricsContainer({ onSeekToLyric }: LyricsContainerProps) {
  const { currentSongTitle, lyrics, offset } = useSongStore()
  const {
    activeFontSize,
    otherFontSize,
    titleFontSize,
    baseLineHeight,
    activeColor,
    otherColor,
    lyricsBgColor,
  } = useUISettingsStore()
  const currentLineIndex = useSyncStore((s) => s.currentLineIndex)

  const lineRefs = useRef<(HTMLDivElement | null)[]>([])

  // Auto-scroll to active line
  useEffect(() => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex]) {
      lineRefs.current[currentLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentLineIndex])

  // Reset refs when lyrics change
  useEffect(() => {
    lineRefs.current = new Array(lyrics.length).fill(null)
  }, [lyrics])

  const handleLineClick = useCallback(
    (index: number) => {
      if (!onSeekToLyric) return
      const line = lyrics[index]
      if (!line) return
      // Seek to the lyric time minus offset (so that applying offset later = correct time)
      onSeekToLyric(line.time - offset)
    },
    [lyrics, offset, onSeekToLyric],
  )

  const getStatus = (index: number): LyricStatus => {
    if (currentLineIndex < 0) return 'upcoming'
    if (index < currentLineIndex) return 'passed'
    if (index === currentLineIndex) return 'active'
    return 'upcoming'
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: lyricsBgColor,
      }}
    >
      <NowSinging title={currentSongTitle} titleFontSize={titleFontSize} />

      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: '30vh 48px',
          scrollBehavior: 'smooth',
        }}
      >
        {lyrics.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              fontSize: '15px',
              color: 'var(--lf-text-dim)',
              padding: '32px 0',
            }}
          >
            無歌詞內容
          </p>
        ) : (
          <div className="flex flex-col">
            {lyrics.map((line, i) => (
              <LyricLine
                key={`${line.time}-${i}`}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                line={line}
                status={getStatus(i)}
                activeFontSize={activeFontSize}
                otherFontSize={otherFontSize}
                activeColor={activeColor}
                otherColor={otherColor}
                passedColor={otherColor}
                lineHeight={baseLineHeight}
                onClick={onSeekToLyric ? () => handleLineClick(i) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
