import { useState, useEffect } from 'react'

interface LineHeightControlProps {
  value: number
  onChange: (value: number) => void
}

export function LineHeightControl({ value, onChange }: LineHeightControlProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value.toFixed(1))

  useEffect(() => {
    if (!editing) setDraft(value.toFixed(1))
  }, [value, editing])

  function adjust(delta: number) {
    const newVal = Math.max(1.0, Math.min(3.0, Math.round((value + delta) * 10) / 10))
    onChange(newVal)
  }

  function commit() {
    const parsed = parseFloat(draft)
    if (!isNaN(parsed)) {
      const clamped = Math.max(1.0, Math.min(3.0, Math.round(parsed * 10) / 10))
      onChange(clamped)
    }
    setEditing(false)
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
        歌詞行距
      </span>
      <button className={btnClass} onClick={() => adjust(-0.1)} style={btnStyle}>
        -
      </button>
      {editing ? (
        <input
          autoFocus
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          style={{
            width: '36px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--lf-text-primary)',
            textAlign: 'center',
            background: 'var(--lf-bg-input)',
            border: '1px solid var(--lf-border)',
            borderRadius: '4px',
            padding: '1px 2px',
            outline: 'none',
          }}
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--lf-text-primary)',
            minWidth: '36px',
            textAlign: 'center',
            cursor: 'text',
          }}
        >
          {value.toFixed(1)}
        </span>
      )}
      <button className={btnClass} onClick={() => adjust(0.1)} style={btnStyle}>
        +
      </button>
    </div>
  )
}
