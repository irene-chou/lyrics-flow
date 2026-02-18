import { useRef } from 'react'
import { MoreVertical, Download, Upload } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportSongs, importSongs } from '@/hooks/useSongLibrary'

export function SongDrawerMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    await exportSongs()
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const count = await importSongs(file)
      alert(`成功匯入 ${count} 首歌曲`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '檔案格式無效'
      alert(`匯入失敗：${msg}`)
    }
    // Reset input
    e.target.value = ''
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1.5 rounded-lg transition-colors cursor-pointer text-lf-text-secondary"
            title="更多"
          >
            <MoreVertical size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-lf-bg-card border border-lf-border"
        >
          <DropdownMenuItem
            onClick={handleExport}
            className="cursor-pointer text-sm text-lf-text-primary"
          >
            <Download size={14} className="mr-2" />
            匯出歌曲庫
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer text-sm text-lf-text-primary"
          >
            <Upload size={14} className="mr-2" />
            匯入歌曲庫
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />
    </>
  )
}
