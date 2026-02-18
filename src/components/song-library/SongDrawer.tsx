import { useState, useMemo, useRef } from 'react'
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
import { useSongs, deleteSongFromDB } from '@/hooks/useSongLibrary'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import type { Song } from '@/types'

interface SongDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SongDrawer({ open, onOpenChange }: SongDrawerProps) {
  const [search, setSearch] = useState('')
  const songs = useSongs()
  const { currentSongId, loadSong } = useSongStore()
  const localFileInputRef = useRef<HTMLInputElement>(null)
  const pendingSongRef = useRef<Song | null>(null)

  const filteredSongs = useMemo(() => {
    if (!songs) return []
    if (!search.trim()) return songs
    const query = search.trim().toLowerCase()
    return songs.filter((s) => s.name.toLowerCase().includes(query))
  }, [songs, search])

  function handleSelect(song: Song) {
    loadSong(song)
    // If local audio, trigger file picker in the same user gesture (synchronous)
    if (song.audioSource === 'local') {
      pendingSongRef.current = song
      localFileInputRef.current?.click()
    }
    onOpenChange(false)
  }

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

  async function handleDelete(song: Song) {
    const confirmed = confirm(`確定要刪除「${song.name}」嗎？`)
    if (!confirmed) return
    await deleteSongFromDB(song.id)
    if (currentSongId === song.id) {
      useSongStore.getState().clearSong()
    }
  }

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
        className="h-full bg-lf-bg-secondary border-l border-lf-border"
        style={{
          width: '380px',
        }}
      >
        {/* Header */}
        <DrawerHeader
          className="flex-row items-center justify-between shrink-0 border-b border-lf-border"
          style={{
            padding: '20px 24px',
          }}
        >
          <div>
            <DrawerTitle
              className="text-lf-text-primary"
              style={{
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              歌曲庫
            </DrawerTitle>
            <DrawerDescription className="sr-only">管理你的歌曲</DrawerDescription>
          </div>
          <SongDrawerMenu />
        </DrawerHeader>

        {/* Body */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{ padding: '16px 24px', gap: '12px' }}
        >
          <SongSearchInput value={search} onChange={setSearch} />

          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ gap: '2px' }}
          >
            {!songs ? (
              <p
                className="text-lf-text-secondary"
                style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '24px 0',
                }}
              >
                載入中...
              </p>
            ) : filteredSongs.length === 0 ? (
              <p
                className="text-lf-text-secondary"
                style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '24px 0',
                }}
              >
                {search.trim() ? '找不到符合的歌曲' : '尚無歌曲'}
              </p>
            ) : (
              filteredSongs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  isActive={currentSongId === song.id}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
