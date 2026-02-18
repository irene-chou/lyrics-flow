import { useState, useEffect } from 'react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  supportTransparent?: boolean
}

export function ColorPicker({
  label,
  value,
  onChange,
  supportTransparent = false,
}: ColorPickerProps) {
  const isTransparent = value === 'transparent'
  const [hexInput, setHexInput] = useState(isTransparent ? '' : value)

  useEffect(() => {
    if (value !== 'transparent') {
      setHexInput(value)
    }
  }, [value])

  function handleColorInput(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value
    setHexInput(color)
    onChange(color)
  }

  function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setHexInput(text)
    // Only apply if it looks like a valid color
    if (/^#[0-9a-fA-F]{6}$/.test(text) || /^#[0-9a-fA-F]{3}$/.test(text)) {
      onChange(text)
    } else if (/^rgba?\(/.test(text)) {
      onChange(text)
    }
  }

  function handleTransparentToggle(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      onChange('transparent')
    } else {
      onChange(hexInput || '#000000')
    }
  }

  // Convert to hex for the native color input (it only accepts #RRGGBB)
  const colorInputValue = isTransparent ? '#000000' : (value.startsWith('#') ? value.slice(0, 7) : '#000000')

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--lf-text-secondary)',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div className="flex items-center" style={{ gap: '8px' }}>
        {/* Color swatch / native picker */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              border: '1px solid var(--lf-border)',
              background: isTransparent
                ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px'
                : value,
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <input
              type="color"
              value={colorInputValue}
              onChange={handleColorInput}
              disabled={isTransparent}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
        {/* Hex text input */}
        <input
          type="text"
          value={isTransparent ? 'transparent' : hexInput}
          onChange={handleTextInput}
          disabled={isTransparent}
          style={{
            flex: 1,
            background: 'var(--lf-bg-input)',
            border: '1px solid var(--lf-border)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: isTransparent ? 'var(--lf-text-dim)' : 'var(--lf-text-primary)',
            outline: 'none',
            minWidth: 0,
          }}
        />
      </div>
      {supportTransparent && (
        <label
          className="flex items-center"
          style={{
            gap: '6px',
            marginTop: '4px',
            fontSize: '11px',
            color: 'var(--lf-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isTransparent}
            onChange={handleTransparentToggle}
            style={{ accentColor: 'var(--lf-accent)' }}
          />
          透明
        </label>
      )}
    </div>
  )
}
