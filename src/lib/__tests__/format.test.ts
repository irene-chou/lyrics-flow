import { describe, it, expect } from 'vitest'
import { formatTime, extractVideoId } from '../format'

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds less than a minute', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats exact minutes', () => {
    expect(formatTime(120)).toBe('02:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(185)).toBe('03:05')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(61.9)).toBe('01:01')
  })

  it('treats negative values as 0', () => {
    expect(formatTime(-10)).toBe('00:00')
  })

  it('treats NaN as 0', () => {
    expect(formatTime(NaN)).toBe('00:00')
  })

  it('handles large values', () => {
    expect(formatTime(3661)).toBe('61:01')
  })
})

describe('extractVideoId', () => {
  it('extracts from standard watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from shorts URL', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('accepts direct 11-char video ID', () => {
    expect(extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('trims whitespace', () => {
    expect(extractVideoId('  dQw4w9WgXcQ  ')).toBe('dQw4w9WgXcQ')
  })

  it('handles URL with extra params', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for invalid input', () => {
    expect(extractVideoId('not a video')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractVideoId('')).toBeNull()
  })

  it('returns null for wrong-length ID', () => {
    expect(extractVideoId('short')).toBeNull()
  })
})
