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
        padding: '16px 48px',
        fontFamily: 'var(--font-lyrics)',
      }}
    >
      <div
        className="text-lf-text-dim"
        style={{
          fontSize: '13px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px',
        }}
      >
        Now Singing
      </div>
      <div
        className="text-lf-text-primary"
        style={{
          fontSize: `${titleFontSize}px`,
          fontWeight: 600,
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
    </div>
  )
}
