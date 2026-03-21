import { Pencil, X } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useSongStore } from '@/stores/useSongStore'
import { useUISettingsStore } from '@/stores/useUISettingsStore'
import { AudioPlayer } from '../playback/AudioPlayer'
import { OffsetControls } from '../playback/OffsetControls'
import { DisplaySettings } from '../settings/DisplaySettings'
import type { Song } from '@/types'
import type { usePlaybackEngine } from '@/hooks/usePlaybackEngine'

interface ControlPanelProps {
  onEditSong: (song: Song) => void
  engine: ReturnType<typeof usePlaybackEngine>
  isMobile?: boolean
  onClose?: () => void
}

export function ControlPanel({ onEditSong, engine, isMobile, onClose }: ControlPanelProps) {
  const { currentSongId, currentSongTitle, currentSongCreatedAt, lrcText, offset, audioSource, youtubeId, audioFileName } = useSongStore(
    useShallow((s) => ({
      currentSongId: s.currentSongId,
      currentSongTitle: s.currentSongTitle,
      currentSongCreatedAt: s.currentSongCreatedAt,
      lrcText: s.lrcText,
      offset: s.offset,
      audioSource: s.audioSource,
      youtubeId: s.youtubeId,
      audioFileName: s.audioFileName,
    }))
  )
  const sidebarWidth = useUISettingsStore((s) => s.sidebarWidth)

  function handleEdit() {
    if (!currentSongId) return
    const song: Song = {
      id: currentSongId,
      name: currentSongTitle,
      lrcText,
      offset,
      audioSource,
      youtubeId,
      audioFileName,
      createdAt: currentSongCreatedAt || Date.now(),
      updatedAt: Date.now(),
    }
    onEditSong(song)
  }

  function handleSeek(time: number) {
    engine.seekTo(time)
  }

  return (
    <aside
      className="flex flex-col overflow-y-auto bg-lb-bg-secondary border-r border-lb-border"
      style={{
        width: isMobile ? '100%' : sidebarWidth,
        height: isMobile ? '100%' : undefined,
        flexShrink: 0,
        padding: isMobile ? '16px' : '24px',
        gap: isMobile ? '16px' : '20px',
      }}
    >
      {/* Mobile header with close button */}
      {isMobile && onClose && (
        <div className="flex items-center justify-between">
          <h2
            className="text-lb-text-primary"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            控制面板
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center transition-colors cursor-pointer text-lb-text-secondary hover:text-lb-text-primary hover:bg-lb-bg-input"
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              border: 'none',
              borderRadius: '6px',
              background: 'none',
            }}
            title="關閉"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 歌曲設定 */}
      <section
        className="flex flex-col border border-lb-border"
        style={{
          borderRadius: 'var(--lb-radius)',
          padding: isMobile ? '12px' : '16px',
          gap: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-lb-text-dim"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            歌曲設定
          </h2>
          {currentSongId && (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center transition-colors cursor-pointer text-lb-text-secondary hover:text-lb-text-primary hover:bg-lb-bg-input"
              style={{
                width: '24px',
                height: '24px',
                padding: 0,
                border: 'none',
                borderRadius: '4px',
              }}
              title="編輯歌曲"
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
        {currentSongId ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="flex-1 min-w-0 truncate text-lb-text-primary"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {currentSongTitle}
              </span>
            </div>

            {/* Audio Player */}
            <AudioPlayer engine={engine} onSeek={handleSeek} />
            <OffsetControls />
          </>
        ) : (
          <p
            className="text-lb-text-secondary"
            style={{ fontSize: '13px' }}
          >
            尚未載入歌曲
          </p>
        )}
      </section>

      {/* 顯示設定 */}
      <DisplaySettings />
    </aside>
  )
}
