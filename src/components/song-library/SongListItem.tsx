import { memo } from 'react'
import { Trash2, FolderInput, FolderMinus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Song, Folder } from '@/types'

interface SongListItemProps {
  song: Song
  isActive: boolean
  folders: Folder[]
  onSelect: (song: Song) => void
  onDelete: (song: Song) => void
  onMove: (song: Song, folderId: number | null) => void
}

export const SongListItem = memo(function SongListItem({
  song,
  isActive,
  folders,
  onSelect,
  onDelete,
  onMove,
}: SongListItemProps) {
  const hasFolders = folders.length > 0

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

      {/* Actions shown on hover */}
      <span
        className="hidden group-hover:flex items-center shrink-0"
        style={{ gap: '4px' }}
      >
        {/* Move to folder */}
        {hasFolders && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
                onClick={(e) => e.stopPropagation()}
                title="移至資料夾"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = isActive ? '#fff' : 'var(--lb-text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none'
                  e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.7)' : 'var(--lb-text-secondary)'
                }}
              >
                <FolderInput size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-lb-bg-card border border-lb-border"
              onClick={(e) => e.stopPropagation()}
            >
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => onMove(song, folder.id)}
                  className="cursor-pointer text-sm text-lb-text-primary"
                  style={{ fontWeight: song.folderId === folder.id ? 600 : undefined }}
                >
                  {song.folderId === folder.id ? '✓ ' : ''}{folder.name}
                </DropdownMenuItem>
              ))}
              {song.folderId !== null && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onMove(song, null)}
                    className="cursor-pointer text-sm text-lb-text-secondary"
                  >
                    <FolderMinus size={13} className="mr-2" />
                    移出資料夾
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Delete */}
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

      {/* Always show actions on active item (non-hover) */}
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
