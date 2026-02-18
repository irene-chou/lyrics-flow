import { describe, it, expect, vi } from 'vitest'

// Mock Dexie before importing song-service
vi.mock('@/lib/db', () => ({
  db: {
    songs: {
      put: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}))

const { importSongs } = await import('../song-service')

function createFile(content: string): File {
  const blob = new Blob([content], { type: 'application/json' })
  const file = new File([blob], 'test.json', { type: 'application/json' })
  // jsdom's File may not support .text(), so polyfill it
  if (!file.text) {
    file.text = () => Promise.resolve(content)
  }
  return file
}

describe('importSongs', () => {
  it('rejects invalid JSON', async () => {
    const file = createFile('not json')
    await expect(importSongs(file)).rejects.toThrow('無效的 JSON 格式')
  })

  it('rejects non-array JSON', async () => {
    const file = createFile('{"foo": "bar"}')
    await expect(importSongs(file)).rejects.toThrow('無效的匯入檔案格式')
  })

  it('skips invalid songs', async () => {
    const songs = [
      { id: -1, name: 'Bad ID' }, // invalid: negative id
      { name: 'Missing ID' }, // invalid: no id
      { id: 1 }, // invalid: no name
    ]
    const file = createFile(JSON.stringify(songs))
    const count = await importSongs(file)
    expect(count).toBe(0)
  })

  it('imports valid songs', async () => {
    const songs = [
      {
        id: 1,
        name: 'Test Song',
        lrcText: '[00:01.00]Hello',
        offset: 0,
        audioSource: 'youtube',
        youtubeId: 'dQw4w9WgXcQ',
        audioFileName: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]
    const file = createFile(JSON.stringify(songs))
    const count = await importSongs(file)
    expect(count).toBe(1)
  })

  it('strips unknown properties from imported songs', async () => {
    const { db } = await import('@/lib/db')
    const songs = [
      {
        id: 1,
        name: 'Test',
        lrcText: '',
        offset: 0,
        audioSource: 'local',
        youtubeId: null,
        audioFileName: 'test.mp3',
        createdAt: 1000,
        updatedAt: 2000,
        malicious: '<script>alert("xss")</script>',
      },
    ]
    const file = createFile(JSON.stringify(songs))
    await importSongs(file)
    const putCall = vi.mocked(db.songs.put).mock.lastCall
    expect(putCall?.[0]).not.toHaveProperty('malicious')
  })

  it('rejects songs with invalid audioSource', async () => {
    const songs = [
      {
        id: 1,
        name: 'Bad Source',
        lrcText: '',
        offset: 0,
        audioSource: 'invalid',
        youtubeId: null,
        audioFileName: null,
        createdAt: 1000,
        updatedAt: 2000,
      },
    ]
    const file = createFile(JSON.stringify(songs))
    const count = await importSongs(file)
    expect(count).toBe(0)
  })
})
