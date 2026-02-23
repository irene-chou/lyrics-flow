import { memo } from 'react'
import { Trash2 } from 'lucide-react'
import type { Song } from '@/types'

interface SongListItemProps {
  song: Song
  isActive: boolean
  onSelect: (song: Song) => void
  onDelete: (song: Song) => void
}

export const SongListItem = memo(function SongListItem({
  song,
  isActive,
  onSelect,
  onDelete,
}: SongListItemProps) {
  return (
    <div
      className="group flex items-center cursor-pointer"
      style={{
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        transition: 'background 0.15s',
        background: isActive ? 'var(--lb-accent)' : 'transparent',
        color: isActive ? '#fff' : 'var(--lb-text-primary)',
      }}
      onClick={() => onSelect(song)}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--lb-bg-input)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <span className="flex-1 min-w-0 truncate">{song.name}</span>
      <span
        className="hidden group-hover:flex items-center shrink-0"
        style={{ gap: '4px' }}
      >
        <button
          className="flex items-center cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            borderRadius: '4px',
            color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--lb-text-secondary)',
            transition: 'all 0.15s',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(song)
          }}
          title="刪除"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.7)' : 'var(--lb-text-secondary)'
          }}
        >
          <Trash2 size={14} />
        </button>
      </span>
      {/* Always show actions on active item */}
      {isActive && (
        <span
          className="flex items-center group-hover:hidden shrink-0"
          style={{ gap: '4px' }}
        >
          <button
            className="flex items-center cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.15s',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(song)
            }}
            title="刪除"
          >
            <Trash2 size={14} />
          </button>
        </span>
      )}
    </div>
  )
})
