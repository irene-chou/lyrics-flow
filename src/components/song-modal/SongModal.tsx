import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { AudioSourceTabs } from './AudioSourceTabs'
import { LrcInputTabs } from './LrcInputTabs'
import { saveSongToDB } from '@/hooks/useSongLibrary'
import { useSongStore } from '@/stores/useSongStore'
import { usePlaybackStore } from '@/stores/usePlaybackStore'
import { extractVideoId } from '@/lib/format'
import type { Song, AudioSource } from '@/types'

interface SongModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editSong?: Song | null
}

export function SongModal({ open, onOpenChange, editSong }: SongModalProps) {
  const [name, setName] = useState('')
  const [audioSource, setAudioSource] = useState<AudioSource>('youtube')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [audioFileName, setAudioFileName] = useState('')
  const [lrcText, setLrcText] = useState('')
  const [lrcTab, setLrcTab] = useState('paste')
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const isEditMode = !!editSong
  const loadSong = useSongStore((s) => s.loadSong)

  useEffect(() => {
    if (open && editSong) {
      setName(editSong.name)
      setAudioSource(editSong.audioSource)
      setYoutubeUrl(editSong.youtubeId || '')
      setAudioFileName(editSong.audioFileName || '')
      setLrcText(editSong.lrcText)
      setAudioFile(null)
    } else if (open && !editSong) {
      setName('')
      setAudioSource('youtube')
      setYoutubeUrl('')
      setAudioFileName('')
      setLrcText('')
      setLrcTab('paste')
      setAudioFile(null)
    }
  }, [open, editSong])

  async function handleSave() {
    if (!lrcText.trim()) {
      alert('請填入 LRC 歌詞。')
      return
    }

    const songName = name.trim() || '未命名歌曲'
    const isYoutube = audioSource === 'youtube'
    const now = Date.now()

    const song: Song = {
      id: isEditMode ? editSong!.id : now,
      name: songName,
      lrcText: lrcText.trim(),
      offset: isEditMode ? editSong!.offset : 0,
      audioSource,
      youtubeId: isYoutube ? extractVideoId(youtubeUrl) : null,
      audioFileName: isYoutube ? null : audioFileName || null,
      createdAt: isEditMode ? editSong!.createdAt : now,
      updatedAt: now,
    }

    await saveSongToDB(song)
    loadSong(song)

    // If local audio, create object URL for playback
    if (audioSource === 'local' && audioFile) {
      const objectUrl = URL.createObjectURL(audioFile)
      usePlaybackStore.getState().setAudioFileObjectUrl(objectUrl)
    }

    onOpenChange(false)
  }

  function handleAudioFileChange(file: File, fileName: string) {
    setAudioFile(file)
    setAudioFileName(fileName)
  }

  function handleSearchSelect(text: string, trackName: string) {
    setLrcText(text)
    if (!name.trim()) {
      setName(trackName)
    }
    setLrcTab('paste')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '編輯歌曲' : '新增歌曲'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode ? '編輯歌曲資訊' : '新增一首新歌曲'}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ padding: '20px', gap: '16px' }}
        >
          {/* Song name */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label
              className="text-lb-text-dim"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              歌曲名稱
            </label>
            <input
              type="text"
              placeholder="輸入歌曲名稱"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: 'var(--lb-bg-input)',
                border: '1px solid var(--lb-border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--lb-text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                outline: 'none',
                transition: 'border-color 0.2s',
                width: '100%',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--lb-accent)'
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--lb-accent-glow)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--lb-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Audio source */}
          <AudioSourceTabs
            audioSource={audioSource}
            onAudioSourceChange={setAudioSource}
            youtubeUrl={youtubeUrl}
            onYoutubeUrlChange={setYoutubeUrl}
            audioFileName={audioFileName}
            onAudioFileChange={handleAudioFileChange}
          />

          {/* LRC input */}
          <LrcInputTabs
            lrcText={lrcText}
            onLrcTextChange={setLrcText}
            activeTab={lrcTab}
            onTabChange={setLrcTab}
            onSearchSelect={handleSearchSelect}
            songName={name}
          />
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--lb-border)',
              background: 'var(--lb-bg-input)',
              color: 'var(--lb-text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--lb-accent)',
              background: 'var(--lb-accent)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            儲存並載入
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
