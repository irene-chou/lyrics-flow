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

  const btnStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    border: '1px solid var(--lf-border)',
    background: 'var(--lf-bg-input)',
    color: 'var(--lf-text-primary)',
    cursor: 'pointer',
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
      <button onClick={() => adjust(-step)} style={btnStyle}>
        A-
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
      <button onClick={() => adjust(step)} style={btnStyle}>
        A+
      </button>
    </div>
  )
}
