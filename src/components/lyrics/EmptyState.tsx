import { Music } from "lucide-react";

export function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center text-lf-text-dim"
      style={{
        height: '100%',
        padding: '48px',
        gap: '16px',
      }}
    >
      {/* <div style={{ fontSize: '48px', opacity: 0.3 }}>🎵</div> */}
      <Music size={48} />
      <p style={{ fontSize: '15px', lineHeight: 1.8 }}>
        載入歌曲開始使用
        <br />
        點擊右上角{' '}
        <span className="text-lf-text-secondary">歌曲庫</span>{' '}
        或按下方 + 按鈕新增歌曲
      </p>
    </div>
  )
}
