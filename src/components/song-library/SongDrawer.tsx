import { useState, useMemo } from 'react'
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
import type { Song } from '@/types'

interface SongDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SongDrawer({ open, onOpenChange }: SongDrawerProps) {
  const [search, setSearch] = useState('')
  const songs = useSongs()
  const { currentSongId, loadSong } = useSongStore()

  const filteredSongs = useMemo(() => {
    if (!songs) return []
    if (!search.trim()) return songs
    const query = search.trim().toLowerCase()
    return songs.filter((s) => s.name.toLowerCase().includes(query))
  }, [songs, search])

  function handleSelect(song: Song) {
    loadSong(song)
    onOpenChange(false)
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
      <DrawerContent
        className="h-full"
        style={{
          background: 'var(--lf-bg-secondary)',
          borderLeft: '1px solid var(--lf-border)',
          width: '380px',
        }}
      >
        {/* Header */}
        <DrawerHeader
          className="flex-row items-center justify-between shrink-0"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--lf-border)',
          }}
        >
          <div>
            <DrawerTitle
              style={{
                color: 'var(--lf-text-primary)',
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
                style={{
                  color: 'var(--lf-text-secondary)',
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '24px 0',
                }}
              >
                載入中...
              </p>
            ) : filteredSongs.length === 0 ? (
              <p
                style={{
                  color: 'var(--lf-text-secondary)',
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
