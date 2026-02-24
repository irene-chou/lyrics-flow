import { memo } from 'react'
import { Download, Youtube } from 'lucide-react'
import type { SharedSong } from '@/types'

interface CloudSongItemProps {
  song: SharedSong
  isImporting: boolean
  onImport: (song: SharedSong) => void
  onPreview: (song: SharedSong) => void
}

export const CloudSongItem = memo(function CloudSongItem({
  song,
  isImporting,
  onImport,
  onPreview,
}: CloudSongItemProps) {
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
        <span className="truncate font-medium">{song.name}</span>
        {song.artist && (
          <span
            className="truncate"
            style={{ color: 'var(--lb-text-secondary)', fontSize: '12px' }}
          >
            {song.artist}
          </span>
        )}
        <div className="flex items-center" style={{ gap: '6px', marginTop: '2px' }}>
          {song.youtube_id && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#ff0000',
                background: 'rgba(255, 0, 0, 0.08)',
                padding: '1px 5px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <Youtube size={9} />
              YT
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
        title="匯入到本機歌曲庫"
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
