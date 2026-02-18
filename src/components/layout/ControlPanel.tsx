import { Pencil } from 'lucide-react'
import { useSongStore } from '@/stores/useSongStore'
import { YouTubePlayer } from '../playback/YouTubePlayer'
import { ManualTimerPanel } from '../playback/ManualTimerPanel'
import { LocalAudioPlayer } from '../playback/LocalAudioPlayer'
import { PlaybackInfo } from '../playback/PlaybackInfo'
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
      className="flex flex-col overflow-y-auto"
      style={{
        width: 'var(--sidebar-width)',
        padding: '24px',
        background: 'var(--lf-bg-secondary)',
        borderRight: '1px solid var(--lf-border)',
        gap: '20px',
      }}
    >
      {/* 歌曲設定 */}
      <section
        className="flex flex-col"
        style={{
          border: '1px solid var(--lf-border)',
          borderRadius: 'var(--lf-radius)',
          padding: '16px',
          gap: '12px',
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--lf-text-dim)',
            }}
          >
            歌曲設定
          </h2>
          {currentSongId && (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center transition-colors cursor-pointer"
              style={{
                width: '24px',
                height: '24px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--lf-text-secondary)',
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
                className="flex-1 min-w-0 truncate"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--lf-text-primary)',
                }}
              >
                {currentSongTitle}
              </span>
            </div>

            {/* Audio Player */}
            <YouTubePlayer engine={engine} />
            <ManualTimerPanel engine={engine} />
            <LocalAudioPlayer engine={engine} />
            <PlaybackInfo onSeek={handleSeek} />
            <OffsetControls />
          </>
        ) : (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--lf-text-secondary)',
            }}
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
