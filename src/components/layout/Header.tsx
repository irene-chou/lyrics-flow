import { useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Link, Check, ListMusic, Menu, FileMusic } from 'lucide-react'
import { getOBSUrl } from '@/lib/piesocket'

interface HeaderProps {
  onOpenDrawer: () => void
  isMobile?: boolean
  onToggleMobilePanel?: () => void
}

export function Header({ onOpenDrawer, isMobile, onToggleMobilePanel }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [copied, setCopied] = useState(false)

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const copyOBSUrl = useCallback(async () => {
    const url = getOBSUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      prompt('請手動複製 OBS URL：', url)
    }
  }, [])

  return (
    <header
      className="flex items-center justify-between gap-4 bg-lf-bg-secondary border-b border-lf-border"
      style={{ padding: isMobile ? '10px 12px' : '12px 20px' }}
    >
      {/* Left: Logo (desktop) / Menu+Logo (mobile) */}
      <div className="flex items-center gap-2 shrink-0">
        {isMobile && onToggleMobilePanel ? (
          <button
            onClick={onToggleMobilePanel}
            className="flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer text-lf-accent"
            title="控制面板"
          >
            <Menu size={20} />
          </button>
        ) : (
          <ListMusic
            size={22}
            className="text-lf-accent"
          />
        )}
        <h1
          className="font-bold text-lf-text-primary tracking-tight"
          style={{ fontSize: isMobile ? '15px' : '18px' }}
        >
          Lyrics Flow
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="header-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          title="切換主題"
        >
          {theme === 'dark' ? <Moon size={isMobile ? 18 : 20} /> : <Sun size={isMobile ? 18 : 20} />}
        </button>

        {/* OBS URL — hide on mobile to save space */}
        {!isMobile && (
          <button
            onClick={copyOBSUrl}
            className={`header-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${copied ? 'text-lf-success' : ''}`}
            title="複製 OBS 瀏覽器來源 URL"
          >
            {copied ? <Check size={20} /> : <Link size={20} />}
          </button>
        )}

        {/* Song drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className="header-accent-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          title="歌曲庫"
        >
          <FileMusic size={isMobile ? 20 : 22} />
        </button>
      </div>
    </header>
  )
}
