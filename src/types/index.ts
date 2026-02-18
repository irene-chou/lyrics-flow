export interface LyricLine {
  time: number
  text: string
}

export interface Song {
  id: number
  name: string
  lrcText: string
  offset: number
  audioSource: 'youtube' | 'local'
  youtubeId: string | null
  audioFileName: string | null
  createdAt: number
  updatedAt: number
}

export interface UISettings {
  activeFontSize: number
  otherFontSize: number
  titleFontSize: number
  baseLineHeight: number
  visibleBefore: number
  visibleAfter: number
  activeColor: string
  otherColor: string
  lyricsBgColor: string
}

export type Theme = 'light' | 'dark'

export type AudioSource = 'youtube' | 'local'

export type PlaybackStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'ENDED'

export type SyncMessageType =
  | 'FULL_STATE'
  | 'LYRICS_LOADED'
  | 'SYNC_UPDATE'
  | 'FONT_SIZE'
  | 'LYRIC_COLORS'
  | 'TITLE_FONT_SIZE'
  | 'LINE_HEIGHT'
  | 'VISIBLE_RANGE'
  | 'OFFSET'
  | 'REQUEST_STATE'

export interface SyncMessage {
  type: SyncMessageType
  data: Record<string, unknown> | null
}
