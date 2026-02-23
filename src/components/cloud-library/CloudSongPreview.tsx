import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import type { CloudSong } from '@/types'
import { formatDuration } from '@/lib/format-duration'

interface CloudSongPreviewProps {
  song: CloudSong | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (song: CloudSong) => void
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

  const lyricsText = song.syncedLyrics || song.plainLyrics || '（無歌詞）'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle style={{ fontSize: '14px' }}>
            {song.trackName}
          </DialogTitle>
          <DialogDescription
            style={{
              fontSize: '12px',
              color: 'var(--lb-text-secondary)',
            }}
          >
            {song.artistName}
            {song.albumName ? ` · ${song.albumName}` : ''}
            {song.duration > 0 ? ` · ${formatDuration(song.duration)}` : ''}
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
            關閉
          </button>
          <button
            onClick={() => onImport(song)}
            disabled={isImporting}
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
            {isImporting ? '匯入中...' : '匯入到歌曲庫'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
