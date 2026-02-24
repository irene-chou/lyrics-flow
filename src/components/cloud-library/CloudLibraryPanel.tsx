import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Loader2, CloudOff, CloudUpload } from 'lucide-react'
import { CloudSongItem } from './CloudSongItem'
import { CloudSongPreview } from './CloudSongPreview'
import { useCloudLibraryStore } from '@/stores/useCloudLibraryStore'
import { importSharedSong } from '@/lib/song-service'
import { publishSong, isCloudConfigured } from '@/lib/supabase'
import { useSongStore } from '@/stores/useSongStore'
import type { SharedSong } from '@/types'

export function CloudLibraryPanel() {
  const {
    query,
    results,
    isLoading,
    error,
    importingId,
    isPublishing,
    hasLoadedLatest,
    setQuery,
    search,
    loadLatest,
    setImportingId,
    setIsPublishing,
  } = useCloudLibraryStore()

  const currentSongId = useSongStore((s) => s.currentSongId)

  const [previewSong, setPreviewSong] = useState<SharedSong | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load latest songs on first mount
  useEffect(() => {
    if (!hasLoadedLatest && isCloudConfigured()) {
      loadLatest()
    }
  }, [hasLoadedLatest, loadLatest])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (value.trim()) {
      searchTimerRef.current = setTimeout(() => {
        search(value.trim())
      }, 500)
    } else {
      // Clear search → show latest
      searchTimerRef.current = setTimeout(() => {
        loadLatest()
      }, 300)
    }
  }, [setQuery, search, loadLatest])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    search(query.trim() || undefined)
  }, [query, search])

  const handleImport = useCallback(async (song: SharedSong) => {
    setImportingId(song.id)
    try {
      const localSong = await importSharedSong(song)
      useSongStore.getState().loadSong(localSong)
      setPreviewOpen(false)
    } catch {
      alert('匯入失敗，請稍後再試。')
    } finally {
      setImportingId(null)
    }
  }, [setImportingId])

  const handlePreview = useCallback((song: SharedSong) => {
    setPreviewSong(song)
    setPreviewOpen(true)
  }, [])

  const handlePublish = useCallback(async () => {
    const state = useSongStore.getState()
    if (!state.currentSongId) {
      alert('請先載入一首歌曲再發布。')
      return
    }
    if (!state.lrcText.trim()) {
      alert('歌詞為空，無法發布。')
      return
    }

    const confirmed = confirm(`確定要將「${state.currentSongTitle}」發布到雲端共用歌曲庫嗎？`)
    if (!confirmed) return

    setIsPublishing(true)
    try {
      await publishSong({
        id: state.currentSongId,
        name: state.currentSongTitle,
        lrcText: state.lrcText,
        offset: state.offset,
        audioSource: state.audioSource,
        youtubeId: state.youtubeId,
        audioFileName: state.audioFileName,
        createdAt: state.currentSongCreatedAt,
        updatedAt: Date.now(),
      })
      alert('發布成功！')
      // Refresh latest list
      loadLatest()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '發布失敗'
      alert(msg)
    } finally {
      setIsPublishing(false)
    }
  }, [setIsPublishing, loadLatest])

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ gap: '12px' }}>
      {/* Publish button */}
      <button
        className="flex items-center justify-center cursor-pointer transition-colors"
        style={{
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--lb-accent)',
          background: currentSongId ? 'var(--lb-accent)' : 'var(--lb-bg-input)',
          color: currentSongId ? '#fff' : 'var(--lb-text-dim)',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 600,
          opacity: isPublishing ? 0.6 : 1,
          cursor: isPublishing || !currentSongId ? 'not-allowed' : 'pointer',
        }}
        onClick={handlePublish}
        disabled={isPublishing || !currentSongId}
      >
        <CloudUpload size={14} />
        {isPublishing ? '發布中...' : '發布目前歌曲到雲端'}
      </button>

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
            placeholder="搜尋共用歌曲（歌名、歌手）..."
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

      {/* Results */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ gap: '2px' }}>
        {isLoading ? (
          <div
            className="flex items-center justify-center"
            style={{ padding: '32px 0', color: 'var(--lb-text-secondary)' }}
          >
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} />
            <span style={{ fontSize: '12px' }}>載入中...</span>
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
          <>
            {!query.trim() && (
              <p style={{ fontSize: '11px', color: 'var(--lb-text-dim)', padding: '0 4px 6px' }}>
                最近發布
              </p>
            )}
            {results.map((song) => (
              <CloudSongItem
                key={song.id}
                song={song}
                isImporting={importingId === song.id}
                onImport={handleImport}
                onPreview={handlePreview}
              />
            ))}
          </>
        ) : query.trim() ? (
          <p
            className="text-lb-text-secondary"
            style={{ fontSize: '12px', textAlign: 'center', padding: '24px 0' }}
          >
            找不到符合的共用歌曲
          </p>
        ) : (
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '32px 0', gap: '8px' }}
          >
            <Search size={24} style={{ color: 'var(--lb-text-dim)' }} />
            <p style={{ fontSize: '12px', color: 'var(--lb-text-secondary)', textAlign: 'center' }}>
              尚無共用歌曲
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
