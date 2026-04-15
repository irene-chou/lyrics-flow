import { useState, useEffect, useCallback } from 'react'
import { HardDrive, Trash2 } from 'lucide-react'
import { db } from '@/lib/db'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}

export function StorageInfo() {
  const [cachedCount, setCachedCount] = useState(0)
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null)

  const refresh = useCallback(async () => {
    const count = await db.audioFiles.count()
    setCachedCount(count)
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate()
      setStorageEstimate({ usage: est.usage ?? 0, quota: est.quota ?? 0 })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleClearAll() {
    if (cachedCount === 0) return
    const confirmed = confirm(`確定要清除所有快取音檔（${cachedCount} 個）嗎？`)
    if (!confirmed) return
    await db.audioFiles.clear()
    refresh()
  }

  return (
    <section
      className="flex flex-col border border-lb-border"
      style={{
        borderRadius: 'var(--lb-radius)',
        padding: '16px',
        gap: '10px',
      }}
    >
      <div className="flex items-center justify-between">
        <h2
          className="text-lb-text-dim"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          儲存空間
        </h2>
        {cachedCount > 0 && (
          <button
            onClick={handleClearAll}
            className="border border-lb-border bg-lb-bg-input text-lb-text-secondary hover:bg-lb-bg-card hover:border-lb-text-dim hover:text-lb-text-primary transition-colors cursor-pointer"
            style={{
              padding: '4px 10px',
              fontSize: '10px',
              borderRadius: '4px',
              fontFamily: 'var(--font-sans)',
            }}
            title="清除所有快取"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-col" style={{ gap: '6px' }}>
        <div className="flex items-center" style={{ gap: '6px' }}>
          <HardDrive size={12} className="text-lb-text-dim shrink-0" />
          <span
            className="text-lb-text-secondary"
            style={{ fontSize: '12px' }}
          >
            已快取 {cachedCount} 個音檔
          </span>
        </div>
        {storageEstimate && storageEstimate.quota > 0 && (
          <>
            <div
              style={{
                height: '4px',
                borderRadius: '2px',
                background: 'var(--lb-bg-input)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((storageEstimate.usage / storageEstimate.quota) * 100, 100)}%`,
                  background: 'var(--lb-accent)',
                  borderRadius: '2px',
                  transition: 'width 0.3s',
                }}
              />
            </div>
            <span
              className="text-lb-text-dim"
              style={{ fontSize: '10px' }}
            >
              {formatBytes(storageEstimate.usage)} / {formatBytes(storageEstimate.quota)}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
