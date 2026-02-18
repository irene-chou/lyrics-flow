/**
 * Format seconds into mm:ss string.
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Extract YouTube video ID from various URL formats or a direct 11-char ID.
 */
export function extractVideoId(input: string): string | null {
  input = input.trim()
  // Direct ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  // Various YouTube URL formats
  const pattern =
    /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
  const m = input.match(pattern)
  if (m) return m[1]
  return null
}
