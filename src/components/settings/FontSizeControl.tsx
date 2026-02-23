import { useState, useEffect } from 'react'
import { CONTROL_BTN_CLASS, CONTROL_BTN_STYLE } from '@/lib/constants'

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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    if (!editing) setDraft(String(value))
  }, [value, editing])

  function adjust(delta: number) {
    const newVal = Math.max(min, Math.min(max, value + delta))
    onChange(newVal)
  }

  function commit() {
    const parsed = parseInt(draft, 10)
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)))
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center" style={{ gap: '8px' }}>
      <span
        className="text-lb-text-secondary"
        style={{
          fontSize: '11px',
          flex: 1,
          minWidth: 0,
        }}
      >
        {label}
      </span>
      <button className={CONTROL_BTN_CLASS} onClick={() => adjust(-step)} style={CONTROL_BTN_STYLE}>
        -
      </button>
      {editing ? (
        <input
          autoFocus
          type="text"
          inputMode="numeric"
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
            color: 'var(--lb-text-primary)',
            textAlign: 'center',
            background: 'var(--lb-bg-input)',
            border: '1px solid var(--lb-border)',
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
            color: 'var(--lb-text-primary)',
            minWidth: '36px',
            textAlign: 'center',
            cursor: 'text',
          }}
        >
          {value}px
        </span>
      )}
      <button className={CONTROL_BTN_CLASS} onClick={() => adjust(step)} style={CONTROL_BTN_STYLE}>
        +
      </button>
    </div>
  )
}
