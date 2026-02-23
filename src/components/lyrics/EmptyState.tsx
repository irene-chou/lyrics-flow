import { Music } from "lucide-react";

interface EmptyStateProps {
  isMobile?: boolean
}

export function EmptyState({ isMobile }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center text-lb-text-dim"
      style={{
        height: '100%',
        padding: isMobile ? '24px 16px' : '48px',
        gap: '16px',
      }}
    >
      <Music size={isMobile ? 36 : 48} />
      <p style={{ fontSize: isMobile ? '14px' : '15px', lineHeight: 1.8 }}>
        載入歌曲開始使用
        <br />
        點擊右上角{' '}
        <span className="text-lb-text-secondary">歌曲庫</span>{' '}
        或按下方 + 按鈕新增歌曲
      </p>
    </div>
  )
}
