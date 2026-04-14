import { useState, useMemo, useCallback } from 'react'
import { X } from 'lucide-react'
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
import { getAudioFile } from '@/lib/song-service'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import type { Song } from '@/types'

interface SongDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isMobile?: boolean
}

export function SongDrawer({ open, onOpenChange, isMobile }: SongDrawerProps) {
  const [search, setSearch] = useState('')
  const songs = useSongs()
  const { currentSongId, loadSong } = useSongStore()

  const filteredSongs = useMemo(() => {
    if (!songs) return []
    if (!search.trim()) return songs
    const query = search.trim().toLowerCase()
    return songs.filter((s) => s.name.toLowerCase().includes(query))
  }, [songs, search])

  const handleSelect = useCallback(async (song: Song) => {
    loadSong(song)
    onOpenChange(false)

    if (song.audioSource === 'local') {
      try {
        const audioFile = await getAudioFile(song.id)
        if (audioFile) {
          const objectUrl = URL.createObjectURL(audioFile.blob)
          usePlaybackStore.getState().setAudioFileObjectUrl(objectUrl)
        }
      } catch (err) {
        console.error('Failed to load cached audio:', err)
      }
      // If no cached blob, AudioPlayer shows "選擇音檔" button as fallback
    }
  }, [loadSong, onOpenChange])

  const handleDelete = useCallback(async (song: Song) => {
    const confirmed = confirm(`確定要刪除「${song.name}」嗎？`)
    if (!confirmed) return
    await deleteSongFromDB(song.id)
    if (useSongStore.getState().currentSongId === song.id) {
      useSongStore.getState().clearSong()
    }
  }, [])

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
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
            <SongDrawerMenu />
          </div>

          <div
            className="flex-1 overflow-y-auto flex flex-col"
            style={{ gap: '2px' }}
          >
            {!songs ? (
              <p
                className="text-lb-text-secondary"
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
                className="text-lb-text-secondary"
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
