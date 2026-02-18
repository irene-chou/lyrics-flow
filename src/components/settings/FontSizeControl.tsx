interface FontSizeControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export function FontSizeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: FontSizeControlProps) {
  function adjust(delta: number) {
    const newVal = Math.max(min, Math.min(max, value + delta))
    onChange(newVal)
  }

  const btnClass = 'border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer'

  const btnStyle: React.CSSProperties = {
    padding: '4px 8px',
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
        {label}
      </span>
      <button className={btnClass} onClick={() => adjust(-step)} style={btnStyle}>
        -
      </button>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--lf-text-primary)',
          minWidth: '36px',
          textAlign: 'center',
        }}
      >
        {value}px
      </span>
      <button className={btnClass} onClick={() => adjust(step)} style={btnStyle}>
        +
      </button>
    </div>
  )
}
