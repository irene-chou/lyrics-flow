import { useState, useMemo, useRef, useCallback } from 'react'
import { X, FolderPlus } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { SongSearchInput } from './SongSearchInput'
import { SongListItem } from './SongListItem'
import { SongDrawerMenu } from './SongDrawerMenu'
import { FolderSection } from './FolderSection'
import {
  useSongs,
  useFolders,
  deleteSongFromDB,
  createFolder,
  updateFolder,
  deleteFolder,
  moveSongToFolder,
} from '@/hooks/useSongLibrary'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import type { Song, Folder } from '@/types'

interface SongDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isMobile?: boolean
}

export function SongDrawer({ open, onOpenChange, isMobile }: SongDrawerProps) {
  const [search, setSearch] = useState('')
  const songs = useSongs()
  const folders = useFolders()
  const { currentSongId, loadSong } = useSongStore()
  const localFileInputRef = useRef<HTMLInputElement>(null)
  const pendingSongRef = useRef<Song | null>(null)

  const filteredSongs = useMemo(() => {
    if (!songs) return []
    if (!search.trim()) return songs
    const query = search.trim().toLowerCase()
    return songs.filter((s) => s.name.toLowerCase().includes(query))
  }, [songs, search])

  // When searching, show a flat list; otherwise group by folder
  const isSearching = search.trim().length > 0

  // Group songs by folder (only used when not searching)
  const { folderSongs, unfolderSongs } = useMemo(() => {
    if (!songs || !folders) return { folderSongs: new Map<number, Song[]>(), unfolderSongs: [] }
    const folderMap = new Map<number, Song[]>()
    for (const f of folders) folderMap.set(f.id, [])
    const uncategorized: Song[] = []
    for (const s of songs) {
      if (s.folderId !== null && folderMap.has(s.folderId)) {
        folderMap.get(s.folderId)!.push(s)
      } else {
        uncategorized.push(s)
      }
    }
    return { folderSongs: folderMap, unfolderSongs: uncategorized }
  }, [songs, folders])

  const handleSelect = useCallback((song: Song) => {
    loadSong(song)
    // If local audio, trigger file picker in the same user gesture (synchronous)
    if (song.audioSource === 'local') {
      pendingSongRef.current = song
      localFileInputRef.current?.click()
    }
    onOpenChange(false)
  }, [loadSong, onOpenChange])

  function handleLocalFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      pendingSongRef.current = null
      return
    }
    const objectUrl = URL.createObjectURL(file)
    usePlaybackStore.getState().setAudioFileObjectUrl(objectUrl)
    // Update file name if different
    if (pendingSongRef.current && file.name !== pendingSongRef.current.audioFileName) {
      useSongStore.getState().setAudioFileName(file.name)
    }
    pendingSongRef.current = null
    // Reset input so re-selecting same file triggers change
    e.target.value = ''
  }

  const handleDelete = useCallback(async (song: Song) => {
    const confirmed = confirm(`確定要刪除「${song.name}」嗎？`)
    if (!confirmed) return
    await deleteSongFromDB(song.id)
    if (useSongStore.getState().currentSongId === song.id) {
      useSongStore.getState().clearSong()
    }
  }, [])

  const handleMove = useCallback(async (song: Song, folderId: number | null) => {
    await moveSongToFolder(song.id, folderId)
    // If this is the currently loaded song, update its folderId in the store
    if (useSongStore.getState().currentSongId === song.id) {
      useSongStore.getState().setFolderId(folderId)
    }
  }, [])

  const handleCreateFolder = useCallback(async () => {
    const name = prompt('資料夾名稱：')
    if (!name?.trim()) return
    await createFolder(name.trim())
  }, [])

  const handleRenameFolder = useCallback(async (folder: Folder, newName: string) => {
    await updateFolder(folder.id, newName)
  }, [])

  const handleDeleteFolder = useCallback(async (folder: Folder) => {
    const confirmed = confirm(`確定要刪除資料夾「${folder.name}」嗎？\n資料夾內的歌曲將移至未分類。`)
    if (!confirmed) return
    await deleteFolder(folder.id)
    // If current song was in this folder, update store
    const state = useSongStore.getState()
    if (state.folderId === folder.id) {
      state.setFolderId(null)
    }
  }, [])

  const folderList = folders ?? []
  const isLoading = !songs

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      {/* Hidden file input for local audio re-selection */}
      <input
        ref={localFileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleLocalFileSelect}
        style={{ display: 'none' }}
      />
      <DrawerContent
        className="h-full bg-lb-bg-secondary border-l border-lb-border"
        style={{
          width: isMobile ? '100vw' : '380px',
        }}
      >
        {/* Header */}
        <DrawerHeader
          className="flex-row items-center justify-between shrink-0 border-b border-lb-border"
          style={{
            padding: isMobile ? '16px' : '20px 24px',
          }}
        >
          <div>
            <DrawerTitle
              className="text-lb-text-primary"
              style={{
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              歌曲庫
            </DrawerTitle>
            <DrawerDescription className="sr-only">管理你的歌曲</DrawerDescription>
          </div>
          <button
            onClick={() => onOpenChange(false)}
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
        </DrawerHeader>

        {/* Body */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ padding: isMobile ? '12px 16px' : '16px 24px', gap: '12px' }}
        >
          <div className="flex items-center" style={{ gap: '8px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <SongSearchInput value={search} onChange={setSearch} />
            </div>
            <button
              onClick={handleCreateFolder}
              className="flex items-center justify-center transition-colors cursor-pointer text-lb-text-secondary hover:text-lb-text-primary hover:bg-lb-bg-input"
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                border: 'none',
                borderRadius: '6px',
                background: 'none',
                flexShrink: 0,
              }}
              title="新增資料夾"
            >
              <FolderPlus size={16} />
            </button>
            <SongDrawerMenu />
          </div>

          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ gap: '2px' }}
          >
            {isLoading ? (
              <p
                className="text-lb-text-secondary"
                style={{ fontSize: '12px', textAlign: 'center', padding: '24px 0' }}
              >
                載入中...
              </p>
            ) : isSearching ? (
              // Flat search results
              filteredSongs.length === 0 ? (
                <p
                  className="text-lb-text-secondary"
                  style={{ fontSize: '12px', textAlign: 'center', padding: '24px 0' }}
                >
                  找不到符合的歌曲
                </p>
              ) : (
                filteredSongs.map((song) => (
                  <SongListItem
                    key={song.id}
                    song={song}
                    isActive={currentSongId === song.id}
                    folders={folderList}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                    onMove={handleMove}
                  />
                ))
              )
            ) : (
              // Grouped view
              <>
                {/* Folders */}
                {folderList.map((folder) => (
                  <FolderSection
                    key={folder.id}
                    folder={folder}
                    songs={folderSongs.get(folder.id) ?? []}
                    currentSongId={currentSongId}
                    folders={folderList}
                    onSelectSong={handleSelect}
                    onDeleteSong={handleDelete}
                    onMoveSong={handleMove}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                  />
                ))}

                {/* Uncategorized songs */}
                {unfolderSongs.length > 0 && (
                  <>
                    {folderList.length > 0 && (
                      <div
                        className="text-lb-text-secondary"
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '8px 8px 4px',
                          letterSpacing: '0.05em',
                        }}
                      >
                        未分類
                      </div>
                    )}
                    {unfolderSongs.map((song) => (
                      <SongListItem
                        key={song.id}
                        song={song}
                        isActive={currentSongId === song.id}
                        folders={folderList}
                        onSelect={handleSelect}
                        onDelete={handleDelete}
                        onMove={handleMove}
                      />
                    ))}
                  </>
                )}

                {/* Empty state */}
                {folderList.length === 0 && unfolderSongs.length === 0 && (
                  <p
                    className="text-lb-text-secondary"
                    style={{ fontSize: '12px', textAlign: 'center', padding: '24px 0' }}
                  >
                    尚無歌曲
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
