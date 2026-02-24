import { useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LyricsSearchTab } from './LyricsSearchTab'

interface LrcInputTabsProps {
  lrcText: string
  onLrcTextChange: (text: string) => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  onSearchSelect?: (lrcText: string, trackName: string) => void
  songName?: string
}

export function LrcInputTabs({
  lrcText,
  onLrcTextChange,
  activeTab,
  onTabChange,
  onSearchSelect,
  songName,
}: LrcInputTabsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    onLrcTextChange(text)
    e.target.value = ''
  }

  return (
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
        LRC 歌詞
      </label>
      <Tabs value={activeTab} defaultValue="paste" onValueChange={onTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="paste" className="flex-1">
            貼上歌詞
          </TabsTrigger>
          <TabsTrigger value="file" className="flex-1">
            讀取檔案
          </TabsTrigger>
          <TabsTrigger value="search" className="flex-1">
            線上搜尋
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <textarea
            placeholder={`在此貼上 LRC 格式歌詞...\n\n範例：\n[00:12.50]第一句歌詞\n[00:18.30]第二句歌詞`}
            value={lrcText}
            onChange={(e) => onLrcTextChange(e.target.value)}
            style={{
              background: 'var(--lb-bg-input)',
              border: '1px solid var(--lb-border)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--lb-text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s',
              width: '100%',
              minHeight: '180px',
              resize: 'vertical',
              lineHeight: 1.7,
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
        </TabsContent>

        <TabsContent value="file">
          <input
            type="text"
            placeholder="點擊選擇 .lrc 檔案"
            readOnly
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--lb-bg-input)',
              border: '1px solid var(--lb-border)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--lb-text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              outline: 'none',
              width: '100%',
              cursor: 'pointer',
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".lrc,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </TabsContent>

        <TabsContent value="search">
          {onSearchSelect && <LyricsSearchTab onSelect={onSearchSelect} initialQuery={songName} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
