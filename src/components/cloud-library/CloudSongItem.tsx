import { memo } from 'react'
import { Download, Music } from 'lucide-react'
import type { CloudSong } from '@/types'
import { formatDuration } from '@/lib/format-duration'

interface CloudSongItemProps {
  song: CloudSong
  isImporting: boolean
  onImport: (song: CloudSong) => void
  onPreview: (song: CloudSong) => void
}

export const CloudSongItem = memo(function CloudSongItem({
  song,
  isImporting,
  onImport,
  onPreview,
}: CloudSongItemProps) {
  const hasSyncedLyrics = !!song.syncedLyrics

  return (
    <div
      className="group flex items-start"
      style={{
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        transition: 'background 0.15s',
        background: 'transparent',
        color: 'var(--lb-text-primary)',
        cursor: 'pointer',
      }}
      onClick={() => onPreview(song)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--lb-bg-input)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {/* Song info */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '2px' }}>
        <span className="truncate font-medium">{song.trackName}</span>
        <span
          className="truncate"
          style={{ color: 'var(--lb-text-secondary)', fontSize: '12px' }}
        >
          {song.artistName}
          {song.albumName ? ` · ${song.albumName}` : ''}
        </span>
        <div className="flex items-center" style={{ gap: '6px', marginTop: '2px' }}>
          {song.duration > 0 && (
            <span style={{ color: 'var(--lb-text-dim)', fontSize: '11px' }}>
              {formatDuration(song.duration)}
            </span>
          )}
          {hasSyncedLyrics && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--lb-accent)',
                background: 'var(--lb-accent-glow)',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              <Music size={9} style={{ display: 'inline', marginRight: '2px', verticalAlign: 'middle' }} />
              同步歌詞
            </span>
          )}
          {song.instrumental && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--lb-text-dim)',
                background: 'var(--lb-bg-input)',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              純音樂
            </span>
          )}
        </div>
      </div>

      {/* Import button */}
      <button
        className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{
          width: '28px',
          height: '28px',
          border: '1px solid var(--lb-border)',
          borderRadius: '6px',
          background: 'var(--lb-bg-card)',
          color: 'var(--lb-text-secondary)',
          padding: 0,
          marginTop: '2px',
          transition: 'all 0.15s',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onImport(song)
        }}
        disabled={isImporting}
        title="匯入到歌曲庫"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--lb-accent)'
          e.currentTarget.style.color = 'var(--lb-accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--lb-border)'
          e.currentTarget.style.color = 'var(--lb-text-secondary)'
        }}
      >
        {isImporting ? (
          <span
            style={{
              width: '12px',
              height: '12px',
              border: '2px solid var(--lb-border)',
              borderTopColor: 'var(--lb-accent)',
              borderRadius: '50%',
              display: 'block',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        ) : (
          <Download size={14} />
        )}
      </button>
    </div>
  )
})
