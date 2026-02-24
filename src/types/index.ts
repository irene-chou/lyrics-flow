export interface LyricLine {
  time: number
  text: string
}

export type AudioSource = 'youtube' | 'local'

export interface Song {
  id: number
  name: string
  lrcText: string
  offset: number
  audioSource: AudioSource
  youtubeId: string | null
  audioFileName: string | null
  createdAt: number
  updatedAt: number
}

export interface UISettings {
  activeFontSize: number
  otherFontSize: number
  titleFontSize: number
  showTitle: boolean
  lyricsGap: number
  visibleBefore: number
  visibleAfter: number
  activeColor: string
  otherColor: string
  lyricsBgColor: string
  sidebarWidth: number
}

export type Theme = 'light' | 'dark'

// --- Shared Cloud Music Library ---

/** A song in the shared cloud library (Supabase). */
export interface SharedSong {
  id: string
  name: string
  artist: string
  lrc_text: string
  offset: number
  youtube_id: string | null
  duration: number
  published_at: string
  updated_at: string
}

export type PlaybackStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'ENDED'

export type SyncMessageType =
  | 'FULL_STATE'
  | 'LYRICS_LOADED'
  | 'SYNC_UPDATE'
  | 'FONT_SIZE'
  | 'LYRIC_COLORS'
  | 'TITLE_FONT_SIZE'
  | 'LYRICS_GAP'
  | 'VISIBLE_RANGE'
  | 'OFFSET'
  | 'REQUEST_STATE'

export type SyncMessage =
  | { type: 'SYNC_UPDATE'; data: { currentLineIndex: number } }
  | { type: 'LYRICS_LOADED'; data: { lyrics: LyricLine[]; songTitle: string } }
  | { type: 'OFFSET'; data: { offset: number } }
  | { type: 'FONT_SIZE'; data: { activeFontSize: number; otherFontSize: number } }
  | { type: 'TITLE_FONT_SIZE'; data: { titleFontSize: number; showTitle: boolean } }
  | { type: 'LYRIC_COLORS'; data: { activeColor: string; otherColor: string; lyricsBgColor: string } }
  | { type: 'LYRICS_GAP'; data: { lyricsGap: number } }
  | { type: 'VISIBLE_RANGE'; data: { visibleBefore: number; visibleAfter: number } }
  | { type: 'FULL_STATE'; data: Record<string, unknown> }
  | { type: 'REQUEST_STATE'; data: null }
