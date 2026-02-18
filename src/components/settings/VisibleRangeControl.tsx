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

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--lf-text-secondary)',
  }

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--lf-text-secondary)',
          marginBottom: '6px',
        }}
      >
        OBS 顯示行數
      </div>
      <div className="flex items-center" style={{ gap: '6px' }}>
        <span style={labelStyle}>前</span>
        <button
          onClick={() => onBeforeChange(Math.max(0, before - 1))}
          style={btnStyle}
        >
          -
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--lf-text-primary)',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {before}
        </span>
        <button
          onClick={() => onBeforeChange(Math.min(5, before + 1))}
          style={btnStyle}
        >
          +
        </button>
        <span style={{ ...labelStyle, marginLeft: '8px' }}>後</span>
        <button
          onClick={() => onAfterChange(Math.max(0, after - 1))}
          style={btnStyle}
        >
          -
        </button>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--lf-text-primary)',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {after}
        </span>
        <button
          onClick={() => onAfterChange(Math.min(5, after + 1))}
          style={btnStyle}
        >
          +
        </button>
      </div>
    </div>
  )
}
