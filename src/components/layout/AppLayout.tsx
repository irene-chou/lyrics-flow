import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Header } from './Header'
import { ControlPanel } from './ControlPanel'
import { LyricsDisplay } from '../lyrics/LyricsDisplay'
import { SongDrawer } from '../song-library/SongDrawer'
import { SongModal } from '../song-modal/SongModal'
import { usePlaybackEngine } from '@/hooks/usePlaybackEngine'
import { useSyncEngine } from '@/hooks/useSyncEngine'
import { useOBSSync } from '@/hooks/useOBSSync'
import { useSyncBroadcast } from '@/hooks/useSyncBroadcast'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import type { Song } from '@/types'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editSong, setEditSong] = useState<Song | null>(null)

  const engine = usePlaybackEngine()

  // Sync engine — uses playback engine to get current time
  useSyncEngine({ getCurrentTime: engine.getCurrentTime })

  // OBS sync — PieSocket broadcast
  const { broadcast } = useOBSSync()
  useSyncBroadcast({ broadcast })

  // Keyboard shortcuts
  useKeyboardShortcuts({ engine, onCloseDrawer: () => setDrawerOpen(false) })

  function handleOpenNewSong() {
    setEditSong(null)
    setModalOpen(true)
  }

  function handleEditSong(song: Song) {
    setEditSong(song)
    setModalOpen(true)
  }

  const handleSeekToLyric = useCallback(
    (time: number) => {
      engine.seekTo(time)
    },
    [engine],
  )

  return (
    <div className="flex h-screen flex-col">
      <Header onOpenDrawer={() => setDrawerOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <ControlPanel onEditSong={handleEditSong} engine={engine} />
        <LyricsDisplay onSeekToLyric={handleSeekToLyric} />
      </div>

      {/* FAB — New Song */}
      <button
        onClick={handleOpenNewSong}
        className="flex items-center justify-center cursor-pointer bg-lf-accent"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 16px rgba(124, 106, 239, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          zIndex: 50,
        }}
        title="新增歌曲"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 106, 239, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 106, 239, 0.4)'
        }}
      >
        <Plus size={24} />
      </button>

      {/* Song Library Drawer */}
      <SongDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      {/* Song Add/Edit Modal */}
      <SongModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editSong={editSong}
      />
    </div>
  )
}
