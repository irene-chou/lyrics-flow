import { Minus, Plus } from 'lucide-react'

interface VisibleRangeControlProps {
  before: number
  after: number
  onBeforeChange: (value: number) => void
  onAfterChange: (value: number) => void
}

export function VisibleRangeControl({
  before,
  after,
  onBeforeChange,
  onAfterChange,
}: VisibleRangeControlProps) {
  const btnClass = 'flex items-center justify-center border border-lf-border bg-lf-bg-input text-lf-text-primary hover:bg-lf-bg-card hover:border-lf-text-dim transition-colors cursor-pointer'

  const btnStyle: React.CSSProperties = {
    width: '22px',
    height: '22px',
    padding: 0,
    borderRadius: '4px',
    lineHeight: 1,
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: '22px',
    fontSize: '11px',
    color: 'var(--lf-text-secondary)',
    lineHeight: 1,
  }

  const valueStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '22px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    lineHeight: 1,
    color: 'var(--lf-text-primary)',
    minWidth: '20px',
  }

  return (
    <div>
      <div
        className="text-lf-text-secondary"
        style={{
          fontSize: '11px',
          marginBottom: '6px',
        }}
      >
        顯示行數
      </div>
      <div className="flex items-center" style={{ gap: '6px' }}>
        <span style={labelStyle}>前</span>
        <button
          className={btnClass}
          onClick={() => onBeforeChange(Math.max(0, before - 1))}
          style={btnStyle}
        >
          <Minus size={12} />
        </button>
        <span style={valueStyle}>
          {before}
        </span>
        <button
          className={btnClass}
          onClick={() => onBeforeChange(Math.min(5, before + 1))}
          style={btnStyle}
        >
          <Plus size={12} />
        </button>
        <span style={{ ...labelStyle, marginLeft: '8px' }}>後</span>
        <button
          className={btnClass}
          onClick={() => onAfterChange(Math.max(0, after - 1))}
          style={btnStyle}
        >
          <Minus size={12} />
        </button>
        <span style={valueStyle}>
          {after}
        </span>
        <button
          className={btnClass}
          onClick={() => onAfterChange(Math.min(5, after + 1))}
          style={btnStyle}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  )
}
