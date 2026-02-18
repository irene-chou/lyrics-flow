import type { LyricLine } from '@/types'

export interface ParseResult {
  lyrics: LyricLine[]
  title: string | null
}

/**
 * Parse LRC format text into an array of timed lyric lines.
 * Supports multiple time tags on the same line.
 */
export function parseLRC(text: string): ParseResult {
  const lines = text.split('\n')
  const result: LyricLine[] = []
  let title: string | null = null

  // Extract [ti:] for song title
  for (const line of lines) {
    const tiMatch = line.match(/^\[ti:\s*(.+?)\s*\]/i)
    if (tiMatch) {
      title = tiMatch[1]
      break
    }
  }

  for (const line of lines) {
    // Skip metadata tags
    if (/^\[(?:ti|ar|al|by|offset|re|ve):/i.test(line)) continue

    // Match multiple time tags: [mm:ss.xx] or [mm:ss:xx] or [mm:ss]
    const timeRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g
    const times: number[] = []
    let match: RegExpExecArray | null

    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1])
      const sec = parseInt(match[2])
      let ms = 0
      if (match[3]) {
        const msStr = match[3]
        ms = msStr.length === 3 ? parseInt(msStr) : parseInt(msStr) * 10
      }
      times.push(min * 60 + sec + ms / 1000)
    }

    // Extract text (everything after the last time tag)
    const textPart = line.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim()

    for (const t of times) {
      result.push({ time: t, text: textPart })
    }
  }

  // Sort by time
  result.sort((a, b) => a.time - b.time)
  return { lyrics: result, title }
}
