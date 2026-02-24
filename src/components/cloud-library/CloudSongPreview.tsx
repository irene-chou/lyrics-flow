import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { SharedSong } from '@/types'

interface CloudSongPreviewProps {
  song: SharedSong | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (song: SharedSong) => void
  isImporting: boolean
}

export function CloudSongPreview({
  song,
  open,
  onOpenChange,
  onImport,
  isImporting,
}: CloudSongPreviewProps) {
  if (!song) return null

  const lyricsText = song.lrc_text || '（無歌詞）'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle style={{ fontSize: '14px' }}>
            {song.name}
          </DialogTitle>
          <DialogDescription
            style={{
              fontSize: '12px',
              color: 'var(--lb-text-secondary)',
            }}
          >
            {song.artist || '未知歌手'}
            {song.youtube_id ? ' · 含 YouTube 連結' : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Lyrics preview */}
        <div
          className="overflow-y-auto"
          style={{
            padding: '16px 20px',
            maxHeight: '400px',
          }}
        >
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              lineHeight: 1.7,
              color: 'var(--lb-text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}
          >
            {lyricsText}
          </pre>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--lb-border)',
              background: 'var(--lb-bg-input)',
              color: 'var(--lb-text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            關閉
          </button>
          <button
            onClick={() => onImport(song)}
            disabled={isImporting}
            className="cursor-pointer"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid var(--lb-accent)',
              background: 'var(--lb-accent)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isImporting ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              opacity: isImporting ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            {isImporting ? '匯入中...' : '匯入到本機'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
