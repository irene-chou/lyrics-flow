interface SongSearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SongSearchInput({ value, onChange }: SongSearchInputProps) {
  return (
    <input
      type="text"
      placeholder="搜尋歌曲..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        flexShrink: 0,
        background: 'var(--lf-bg-input)',
        border: '1px solid var(--lf-border)',
        borderRadius: '8px',
        padding: '6px 14px',
        color: 'var(--lf-text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        outline: 'none',
        width: '100%',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--lf-accent)'
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--lf-accent-glow)'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--lf-border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    />
  )
}
