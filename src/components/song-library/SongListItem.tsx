import { memo, useState } from 'react'
import { Trash2, FolderInput, FolderMinus, GripVertical, HardDrive, X } from 'lucide-react'
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
  hasCachedAudio?: boolean
  onSelect: (song: Song) => void
  onDelete: (song: Song) => void
  onMove: (song: Song, folderId: number | null) => void
  onClearCache?: (song: Song) => void
}

export const SongListItem = memo(function SongListItem({
  song,
  isActive,
  folders,
  hasCachedAudio = false,
  onSelect,
  onDelete,
  onMove,
  onClearCache,
}: SongListItemProps) {
  const hasFolders = folders.length > 0
  const [isDragging, setIsDragging] = useState(false)
  const actionColor = isActive ? 'rgba(255,255,255,0.7)' : 'var(--lb-text-secondary)'

  return (
    <div
      className="group flex items-center cursor-pointer"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(song.id))
        e.dataTransfer.effectAllowed = 'move'
        setIsDragging(true)
      }}
      onDragEnd={() => setIsDragging(false)}
      style={{
        gap: '4px',
        padding: '10px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        transition: isDragging ? 'none' : 'background 0.15s',
        background: isActive ? 'var(--lb-accent)' : 'transparent',
        color: isActive ? '#fff' : 'var(--lb-text-primary)',
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={() => onSelect(song)}
      onMouseEnter={(e) => {
        if (!isActive && !isDragging) {
          e.currentTarget.style.background = 'var(--lb-bg-input)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {/* Drag handle — always in layout so it doesn't shift other elements;
          invisible until hover so it doesn't clutter the resting state */}
      <span
        className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 text-lb-text-secondary"
        style={{ cursor: 'grab' }}
        title="拖曳移動"
      >
        <GripVertical size={14} />
      </span>

      <span className="flex-1 min-w-0 truncate">{song.name}</span>

      {/* Cache status indicator (visible when not hovered, only when cached) */}
      {hasCachedAudio && (
        <span
          className="flex items-center shrink-0 group-hover:hidden"
          title="已快取音檔"
          style={{ color: actionColor }}
        >
          <HardDrive size={12} />
        </span>
      )}

      {/* Action buttons — always in layout (visibility via opacity) so Radix
          DropdownMenu can measure the trigger position correctly */}
      <span
        className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto flex items-center shrink-0"
        style={{ gap: '4px' }}
      >
        {/* Clear cache */}
        {hasCachedAudio && onClearCache && (
          <button
            className="flex items-center cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              borderRadius: '4px',
              color: actionColor,
              transition: 'all 0.15s',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onClearCache(song)
            }}
            title="清除音檔快取"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = actionColor
            }}
          >
            <X size={14} />
          </button>
        )}

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
                  color: actionColor,
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
                  e.currentTarget.style.color = actionColor
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
            color: actionColor,
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
            e.currentTarget.style.color = actionColor
          }}
        >
          <Trash2 size={14} />
        </button>
      </span>

      {/* Active item: show delete when NOT hovering (hover shows the span above) */}
      {isActive && (
        <span
          className="flex group-hover:hidden items-center shrink-0"
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
