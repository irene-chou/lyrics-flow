import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { useSyncStore } from '@/stores/useSyncStore'
import { NowSinging } from './NowSinging'
import { LyricLine } from './LyricLine'
import type { LyricStatus } from './LyricLine'

interface LyricsContainerProps {
  onSeekToLyric?: (time: number) => void
  isMobile?: boolean
}

export function LyricsContainer({ onSeekToLyric, isMobile }: LyricsContainerProps) {
  const currentSongTitle = useSongStore((s) => s.currentSongTitle)
  const lyrics = useSongStore((s) => s.lyrics)
  const offset = useSongStore((s) => s.offset)
  const activeFontSize = useUISettingsStore((s) => s.activeFontSize)
  const otherFontSize = useUISettingsStore((s) => s.otherFontSize)
  const titleFontSize = useUISettingsStore((s) => s.titleFontSize)
  const showTitle = useUISettingsStore((s) => s.showTitle)
  const lyricsGap = useUISettingsStore((s) => s.lyricsGap)
  const activeColor = useUISettingsStore((s) => s.activeColor)
  const otherColor = useUISettingsStore((s) => s.otherColor)
  const lyricsBgColor = useUISettingsStore((s) => s.lyricsBgColor)
  const currentLineIndex = useSyncStore((s) => s.currentLineIndex)

  const scrollRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLDivElement | null)[]>([])
  const currentSongId = useSongStore((s) => s.currentSongId)

  // Reset scroll position when song changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [currentSongId])

  // Auto-scroll to active line
  useEffect(() => {
    if (currentLineIndex >= 0 && lineRefs.current[currentLineIndex]) {
      lineRefs.current[currentLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentLineIndex])

  // Use ref for handleLineClick so per-line handlers stay stable across offset/lyrics changes
  const handleLineClickRef = useRef<(index: number) => void>(() => {})
  handleLineClickRef.current = useCallback(
    (index: number) => {
      if (!onSeekToLyric) return
      const line = lyrics[index]
      if (!line) return
      onSeekToLyric(line.time - offset)
    },
    [lyrics, offset, onSeekToLyric],
  )

  // Pre-compute statuses so only lines whose status changed will re-render
  const statuses = useMemo<LyricStatus[]>(() => {
    return lyrics.map((_, i) => {
      if (currentLineIndex < 0) return 'upcoming'
      if (i < currentLineIndex) return 'passed'
      if (i === currentLineIndex) return 'active'
      return 'upcoming'
    })
  }, [lyrics, currentLineIndex])

  // Stable per-line ref setters — only rebuilt when lyrics array changes
  const lineRefSetters = useRef<((el: HTMLDivElement | null) => void)[]>([])

  // Stable per-line click handlers — only rebuilt when lyrics array changes
  const lineClickHandlers = useRef<(() => void)[]>([])

  useEffect(() => {
    lineRefs.current = new Array(lyrics.length).fill(null)
    lineRefSetters.current = lyrics.map((_, i) => (el: HTMLDivElement | null) => {
      lineRefs.current[i] = el
    })
    lineClickHandlers.current = onSeekToLyric
      ? lyrics.map((_, i) => () => handleLineClickRef.current(i))
      : []
  }, [lyrics, onSeekToLyric])

  const containerStyle = useMemo(() => ({ background: lyricsBgColor }), [lyricsBgColor])
  const scrollStyle = useMemo(
    () => ({ padding: isMobile ? '20vh 16px' : '30vh 48px', scrollBehavior: 'smooth' as const }),
    [isMobile],
  )
  const gapStyle = useMemo(() => ({ gap: `${lyricsGap}px` }), [lyricsGap])

  return (
    <div className="flex flex-col h-full" style={containerStyle}>
      {showTitle && <NowSinging title={currentSongTitle} titleFontSize={titleFontSize} isMobile={isMobile} />}

      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={scrollStyle}>
        {lyrics.length === 0 ? (
          <p
            className="text-lb-text-dim"
            style={{
              textAlign: 'center',
              fontSize: '15px',
              padding: '32px 0',
            }}
          >
            無歌詞內容
          </p>
        ) : (
          <div className="flex flex-col" style={gapStyle}>
            {lyrics.map((line, i) => (
              <LyricLine
                key={`${line.time}-${i}`}
                ref={lineRefSetters.current[i]}
                line={line}
                status={statuses[i]}
                activeFontSize={activeFontSize}
                otherFontSize={otherFontSize}
                activeColor={activeColor}
                otherColor={otherColor}
                passedColor={otherColor}
                onClick={lineClickHandlers.current[i]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
