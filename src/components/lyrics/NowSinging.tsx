interface NowSingingProps {
  title: string
  titleFontSize?: number
}

export function NowSinging({ title, titleFontSize = 18 }: NowSingingProps) {
  if (!title) return null

  return (
    <div
      className="shrink-0"
      style={{
        padding: '16px 68px',
        fontFamily: 'var(--font-lyrics)',
      }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--lf-text-dim)',
          marginBottom: '4px',
        }}
      >
        Now Singing
      </div>
      <div
        style={{
          fontSize: `${titleFontSize}px`,
          fontWeight: 600,
          color: 'var(--lf-text-primary)',
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
    </div>
  )
}
