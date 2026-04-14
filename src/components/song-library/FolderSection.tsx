import { useState, useRef } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SongListItem } from './SongListItem'
import type { Folder as FolderType, Song } from '@/types'

interface FolderSectionProps {
  folder: FolderType
  songs: Song[]
  currentSongId: number | null
  folders: FolderType[]
  onSelectSong: (song: Song) => void
  onDeleteSong: (song: Song) => void
  onMoveSong: (song: Song, folderId: number | null) => void
  onRenameFolder: (folder: FolderType, newName: string) => void
  onDeleteFolder: (folder: FolderType) => void
}

export function FolderSection({
  folder,
  songs,
  currentSongId,
  folders,
  onSelectSong,
  onDeleteSong,
  onMoveSong,
  onRenameFolder,
  onDeleteFolder,
}: FolderSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(folder.name)
  const inputRef = useRef<HTMLInputElement>(null)

  function startRename() {
    setRenameValue(folder.name)
    setIsRenaming(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }

  function commitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== folder.name) {
      onRenameFolder(folder, trimmed)
    }
    setIsRenaming(false)
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename()
    if (e.key === 'Escape') setIsRenaming(false)
  }

  return (
    <div>
      {/* Folder header */}
      <div
        className="group flex items-center"
        style={{
          padding: '6px 8px',
          borderRadius: '6px',
          gap: '4px',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--lb-bg-input)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {/* Expand/collapse toggle */}
        <button
          className="flex items-center shrink-0 text-lb-text-secondary"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Folder icon */}
        <span className="shrink-0 text-lb-text-secondary" onClick={() => setExpanded(v => !v)}>
          {expanded ? <FolderOpen size={14} /> : <Folder size={14} />}
        </span>

        {/* Folder name or rename input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--lb-bg-input)',
              border: '1px solid var(--lb-accent)',
              borderRadius: '4px',
              padding: '1px 6px',
              color: 'var(--lb-text-primary)',
              outline: 'none',
            }}
          />
        ) : (
          <span
            className="flex-1 min-w-0 truncate text-lb-text-secondary"
            style={{ fontSize: '12px', fontWeight: 600, userSelect: 'none' }}
            onClick={() => setExpanded(v => !v)}
          >
            {folder.name}
          </span>
        )}

        {/* Song count badge */}
        <span
          className="shrink-0 text-lb-text-secondary"
          style={{ fontSize: '11px' }}
          onClick={() => setExpanded(v => !v)}
        >
          {songs.length}
        </span>

        {/* Folder actions menu */}
        <span className="hidden group-hover:flex shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center justify-center text-lb-text-secondary hover:text-lb-text-primary"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '20px',
                  height: '20px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-lb-bg-card border border-lb-border">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); startRename() }}
                className="cursor-pointer text-sm text-lb-text-primary"
              >
                <Pencil size={13} className="mr-2" />
                重新命名
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder) }}
                className="cursor-pointer text-sm text-red-400"
              >
                <Trash2 size={13} className="mr-2" />
                刪除資料夾
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </div>

      {/* Songs in folder */}
      {expanded && (
        <div style={{ paddingLeft: '20px' }}>
          {songs.length === 0 ? (
            <p
              className="text-lb-text-secondary"
              style={{ fontSize: '11px', padding: '6px 12px', fontStyle: 'italic' }}
            >
              （空的）
            </p>
          ) : (
            songs.map((song) => (
              <SongListItem
                key={song.id}
                song={song}
                isActive={currentSongId === song.id}
                folders={folders}
                onSelect={onSelectSong}
                onDelete={onDeleteSong}
                onMove={onMoveSong}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
