import { Pencil } from 'lucide-react'
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
}

export function ControlPanel({ onEditSong, engine }: ControlPanelProps) {
  const { currentSongId, currentSongTitle, lrcText, offset, audioSource, youtubeId, audioFileName } = useSongStore()
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
      createdAt: 0,
      updatedAt: 0,
    }
    onEditSong(song)
  }

  function handleSeek(time: number) {
    engine.seekTo(time)
  }

  return (
    <aside
      className="flex flex-col overflow-y-auto bg-lf-bg-secondary border-r border-lf-border"
      style={{
        width: sidebarWidth,
      flexShrink: 0,
        padding: '24px',
        gap: '20px',
      }}
    >
      {/* 歌曲設定 */}
      <section
        className="flex flex-col border border-lf-border"
        style={{
          borderRadius: 'var(--lf-radius)',
          padding: '16px',
          gap: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-lf-text-dim"
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
              className="flex items-center justify-center transition-colors cursor-pointer text-lf-text-secondary hover:text-lf-text-primary hover:bg-lf-bg-input"
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
                className="flex-1 min-w-0 truncate text-lf-text-primary"
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
            className="text-lf-text-secondary"
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
