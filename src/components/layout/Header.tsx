import { useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Link, Check, ListMusic } from 'lucide-react'
import { getOBSUrl } from '@/lib/piesocket'

interface HeaderProps {
  onOpenDrawer: () => void
}

export function Header({ onOpenDrawer }: HeaderProps) {
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
      className="flex items-center justify-between gap-4"
      style={{
        padding: '12px 20px',
        background: 'var(--lf-bg-secondary)',
        borderBottom: '1px solid var(--lf-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <ListMusic
          size={18}
          style={{ color: 'var(--lf-accent)' }}
        />
        <h1
          className="text-lg font-bold"
          style={{
            color: 'var(--lf-text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Lyrics Flow
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="header-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          title="切換主題"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* OBS URL */}
        <button
          onClick={copyOBSUrl}
          className="header-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          style={copied ? { color: 'var(--lf-success)' } : undefined}
          title="複製 OBS 瀏覽器來源 URL"
        >
          {copied ? <Check size={20} /> : <Link size={20} />}
        </button>

        {/* Song drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className="header-accent-btn flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          title="歌曲庫"
        >
          <ListMusic size={20} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  )
}
