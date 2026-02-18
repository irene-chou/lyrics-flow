interface LineHeightControlProps {
  value: number
  onChange: (value: number) => void
}

export function LineHeightControl({ value, onChange }: LineHeightControlProps) {
  function adjust(delta: number) {
    const newVal = Math.max(1.0, Math.min(3.0, Math.round((value + delta) * 10) / 10))
    onChange(newVal)
  }

  const btnClass = 'border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer'

  const btnStyle: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    fontFamily: 'var(--font-sans)',
    lineHeight: 1,
  }

  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <span
        className="text-lf-text-secondary"
        style={{
          fontSize: '11px',
          flex: 1,
          minWidth: 0,
        }}
      >
        歌詞行距
      </span>
      <button className={btnClass} onClick={() => adjust(-0.1)} style={btnStyle}>
        -
      </button>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--lf-text-primary)',
          minWidth: '32px',
          textAlign: 'center',
        }}
      >
        {value.toFixed(1)}
      </span>
      <button className={btnClass} onClick={() => adjust(0.1)} style={btnStyle}>
        +
      </button>
    </div>
  )
}
