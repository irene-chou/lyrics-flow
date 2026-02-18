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
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-2 h-2 rounded-full animate-[pulse_2s_ease-in-out_infinite]"
          style={{
            background: 'var(--lf-accent)',
            boxShadow: '0 0 12px var(--lf-accent-glow)',
          }}
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
      <div className="flex items-center gap-4 ml-auto shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          style={{ color: 'var(--lf-accent)' }}
          title="切換主題"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* OBS URL */}
        <button
          onClick={copyOBSUrl}
          className="flex items-center justify-center gap-1.5 h-8 rounded-md transition-all cursor-pointer"
          style={{
            minWidth: '68px',
            padding: '0 12px',
            background: 'var(--lf-bg-secondary)',
            border: `1px solid ${copied ? 'var(--lf-success)' : 'var(--lf-border)'}`,
            color: copied ? 'var(--lf-success)' : 'var(--lf-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}
          title="複製 OBS 瀏覽器來源 URL"
        >
          <span>{copied ? 'copied!' : 'OBS'}</span>
          {copied ? <Check size={14} /> : <Link size={14} />}
        </button>

        {/* Song drawer trigger */}
        <button
          onClick={onOpenDrawer}
          className="flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer"
          style={{ color: 'var(--lf-accent)' }}
          title="歌曲庫"
        >
          <ListMusic size={24} />
        </button>
      </div>
    </header>
  )
}
