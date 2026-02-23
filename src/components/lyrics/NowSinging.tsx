import { memo } from 'react'

interface NowSingingProps {
  title: string
  titleFontSize?: number
  isMobile?: boolean
}

export const NowSinging = memo(function NowSinging({ title, titleFontSize = 18, isMobile }: NowSingingProps) {
  if (!title) return null

  return (
    <div
      className="shrink-0"
      style={{
        padding: isMobile ? '16px' : '16px 48px',
        fontFamily: 'var(--font-lyrics)',
      }}
    >
      <div
        className="text-lb-text-dim"
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
        className="text-lb-text-primary"
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
})
