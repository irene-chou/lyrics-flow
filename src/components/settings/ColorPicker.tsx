import { useState, useEffect, useRef } from 'react'
import { RgbaColorPicker } from 'react-colorful'

// --- Helpers ---

type RgbaColor = { r: number; g: number; b: number; a: number }

/** Parse any CSS color string into an RGBA object (a: 0-1) */
function parseColor(value: string): RgbaColor {
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }

  // rgba(r, g, b, a)
  const rgbaMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
  )
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    }
  }

  // #RRGGBB or #RGB
  if (/^#[0-9a-fA-F]{3,6}$/.test(value)) {
    const h = value.replace('#', '')
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 }
}

/** Format RGBA object into a CSS color string */
function formatColor(c: RgbaColor): string {
  if (c.a >= 1) {
    return (
      '#' +
      [c.r, c.g, c.b]
        .map((v) => Math.round(v).toString(16).padStart(2, '0'))
        .join('')
    )
  }
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a})`
}

/** Format RGBA object into a display hex string */
function toHex(c: RgbaColor): string {
  return (
    '#' +
    [c.r, c.g, c.b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
  )
}

// --- Component ---

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState<RgbaColor>(() => parseColor(value))
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Sync from external value changes
  useEffect(() => {
    setColor(parseColor(value))
  }, [value])

  // Close picker on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleChange(newColor: RgbaColor) {
    setColor(newColor)
    onChange(formatColor(newColor))
  }

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value
    if (/^#[0-9a-fA-F]{6}$/.test(text) || /^#[0-9a-fA-F]{3}$/.test(text)) {
      const parsed = parseColor(text)
      const next = { ...parsed, a: color.a }
      setColor(next)
      onChange(formatColor(next))
    }
  }

  // Swatch preview color
  const swatchCss = formatColor(color)
  const hexDisplay = toHex(color)

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div
        className="text-lf-text-secondary"
        style={{
          fontSize: '11px',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>

      {/* Swatch + hex display */}
      <div className="flex items-center" style={{ gap: '8px' }}>
        {/* Hex text input */}
        <input
          type="text"
          defaultValue={hexDisplay}
          key={hexDisplay}
          onBlur={handleHexInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleHexInput(e as unknown as React.ChangeEvent<HTMLInputElement>)
          }}
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
        {/* Color swatch — click to toggle picker */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
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
            cursor: 'pointer',
            padding: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: swatchCss,
            }}
          />
        </button>
      </div>

      {/* Floating picker panel */}
      {open && (
        <div
          className="lf-color-picker"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '6px',
            zIndex: 50,
            background: 'var(--lf-bg-card)',
            border: '1px solid var(--lf-border)',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            width: '220px',
          }}
        >
          <RgbaColorPicker color={color} onChange={handleChange} />
        </div>
      )}
    </div>
  )
}
