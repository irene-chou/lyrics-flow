import { useState, useCallback, useRef } from 'react'
import { Search, Loader2, CloudOff } from 'lucide-react'
import { CloudSongItem } from './CloudSongItem'
import { CloudSongPreview } from './CloudSongPreview'
import { useCloudLibraryStore } from '@/stores/useCloudLibraryStore'
import { importCloudSong } from '@/lib/song-service'
import { useSongStore } from '@/stores/useSongStore'
import type { CloudSong } from '@/types'

export function CloudLibraryPanel() {
  const {
    query,
    results,
    isSearching,
    error,
    importingId,
    setQuery,
    search,
    setImportingId,
  } = useCloudLibraryStore()

  const [previewSong, setPreviewSong] = useState<CloudSong | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    // Debounced auto-search
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (value.trim()) {
      searchTimerRef.current = setTimeout(() => {
        search({ q: value.trim() })
      }, 500)
    }
  }, [setQuery, search])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (query.trim()) {
      search({ q: query.trim() })
    }
  }, [query, search])

  const handleImport = useCallback(async (song: CloudSong) => {
    setImportingId(song.id)
    try {
      const localSong = await importCloudSong(song)
      useSongStore.getState().loadSong(localSong)
      setPreviewOpen(false)
    } catch {
      alert('匯入失敗，請稍後再試。')
    } finally {
      setImportingId(null)
    }
  }, [setImportingId])

  const handlePreview = useCallback((song: CloudSong) => {
    setPreviewSong(song)
    setPreviewOpen(true)
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ gap: '12px' }}>
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="flex items-center" style={{ gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--lb-text-dim)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="搜尋雲端歌詞（歌名、歌手）..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            style={{
              flexShrink: 0,
              background: 'var(--lb-bg-input)',
              border: '1px solid var(--lb-border)',
              borderRadius: '8px',
              padding: '6px 14px 6px 32px',
              color: 'var(--lb-text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              outline: 'none',
              width: '100%',
              transition: 'border-color 0.2s',
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
      </form>

      {/* Provider attribution */}
      <div
        style={{
          fontSize: '10px',
          color: 'var(--lb-text-dim)',
          textAlign: 'center',
          padding: '0 4px',
        }}
      >
        歌詞來源：
        <a
          href="https://lrclib.net"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--lb-accent)', textDecoration: 'none' }}
        >
          LRCLIB
        </a>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ gap: '2px' }}>
        {isSearching ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: '32px 0', color: 'var(--lb-text-secondary)' }}
          >
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
            <span style={{ fontSize: '12px' }}>搜尋中...</span>
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '32px 0', gap: '8px' }}
          >
            <CloudOff size={24} style={{ color: 'var(--lb-text-dim)' }} />
            <p style={{ fontSize: '12px', color: 'var(--lb-text-secondary)', textAlign: 'center' }}>
              {error}
            </p>
          </div>
        ) : results.length > 0 ? (
          results.map((song) => (
            <CloudSongItem
              key={song.id}
              song={song}
              isImporting={importingId === song.id}
              onImport={handleImport}
              onPreview={handlePreview}
            />
          ))
        ) : query.trim() ? (
          <p
            className="text-lb-text-secondary"
            style={{ fontSize: '12px', textAlign: 'center', padding: '24px 0' }}
          >
            找不到符合的雲端歌詞
          </p>
        ) : (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '32px 0', gap: '8px' }}
          >
            <Search size={24} style={{ color: 'var(--lb-text-dim)' }} />
            <p style={{ fontSize: '12px', color: 'var(--lb-text-secondary)', textAlign: 'center' }}>
              輸入歌名或歌手名稱搜尋
            </p>
          </div>
        )}
      </div>

      {/* Preview dialog */}
      <CloudSongPreview
        song={previewSong}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onImport={handleImport}
        isImporting={importingId === previewSong?.id}
      />
    </div>
  )
}
