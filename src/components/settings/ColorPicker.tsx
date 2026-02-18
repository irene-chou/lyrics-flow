import { useState, useEffect } from 'react'

// --- Helpers ---

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  )
}

/** Parse any color string into { hex, opacity (0-100) } */
function parseColor(value: string): { hex: string; opacity: number } {
  if (value === 'transparent') return { hex: '#000000', opacity: 0 }

  // rgba(r, g, b, a)
  const rgbaMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
  )
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1])
    const g = parseInt(rgbaMatch[2])
    const b = parseInt(rgbaMatch[3])
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    return { hex: rgbToHex(r, g, b), opacity: Math.round(a * 100) }
  }

  // #RRGGBB or #RGB
  if (/^#[0-9a-fA-F]{3,6}$/.test(value)) {
    const h = value.replace('#', '')
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return { hex: '#' + full.toLowerCase(), opacity: 100 }
  }

  return { hex: '#000000', opacity: 100 }
}

/** Format hex + opacity into a CSS color string */
function formatColor(hex: string, opacity: number): string {
  if (opacity >= 100) return hex
  const { r, g, b } = hexToRgb(hex)
  const a = Math.round(opacity) / 100
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// --- Component ---

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({
  label,
  value,
  onChange,
}: ColorPickerProps) {
  const parsed = parseColor(value)
  const [hexInput, setHexInput] = useState(parsed.hex)
  const [opacity, setOpacity] = useState(parsed.opacity)

  // Sync from external value changes
  useEffect(() => {
    const p = parseColor(value)
    setHexInput(p.hex)
    setOpacity(p.opacity)
  }, [value])

  function emitChange(hex: string, op: number) {
    onChange(formatColor(hex, op))
  }

  function handleColorInput(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value
    setHexInput(color)
    emitChange(color, opacity)
  }

  function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    setHexInput(text)
    if (/^#[0-9a-fA-F]{6}$/.test(text) || /^#[0-9a-fA-F]{3}$/.test(text)) {
      emitChange(text, opacity)
    }
  }

  function handleOpacityChange(e: React.ChangeEvent<HTMLInputElement>) {
    const op = parseInt(e.target.value)
    setOpacity(op)
    emitChange(hexInput, op)
  }

  // Native color input only accepts #RRGGBB
  const colorInputValue = parsed.hex

  // Swatch preview with checkerboard behind for transparency
  const swatchColor = formatColor(parsed.hex, opacity)

  return (
    <div>
      <div
        className="text-lf-text-secondary"
        style={{
          fontSize: '11px',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>

      {/* Single row: swatch + hex input + opacity slider + % */}
      <div className="flex items-center" style={{ gap: '6px' }}>
        {/* Color swatch with checkerboard background */}
        <div
          style={{
            position: 'relative',
            width: '22px',
            height: '22px',
            borderRadius: '4px',
            border: '1px solid var(--lf-border)',
            background:
              'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Color overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: swatchColor,
            }}
          />
          <input
            type="color"
            value={colorInputValue}
            onChange={handleColorInput}
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
        {/* Hex text input */}
        <input
          type="text"
          value={hexInput}
          onChange={handleTextInput}
          style={{
            width: '72px',
            background: 'var(--lf-bg-input)',
            border: '1px solid var(--lf-border)',
            borderRadius: '4px',
            padding: '3px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--lf-text-primary)',
            outline: 'none',
            flexShrink: 0,
          }}
        />
        {/* Opacity slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={handleOpacityChange}
          style={{
            flex: 1,
            height: '4px',
            accentColor: 'var(--lf-accent)',
            cursor: 'pointer',
            minWidth: '40px',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--lf-text-secondary)',
            width: '28px',
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {`${opacity}%`}
        </span>
      </div>
    </div>
  )
}
