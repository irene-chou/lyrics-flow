import Dexie, { type EntityTable } from 'dexie'
import type { Song, AudioFile } from '@/types'

const db = new Dexie('lyribox-db') as Dexie & {
  songs: EntityTable<Song, 'id'>
  audioFiles: EntityTable<AudioFile, 'songId'>
}

db.version(1).stores({
  songs: 'id',
})

db.version(2).stores({
  songs: 'id',
}).upgrade(tx => {
  return tx.table('songs').toCollection().modify(song => {
    if (song.pitch === undefined) {
      song.pitch = 0
    }
  })
})

db.version(3).stores({
  songs: 'id',
  audioFiles: 'songId',
})

db.version(4).stores({
  songs: 'id',
  audioFiles: 'songId',
}).upgrade(tx => {
  return tx.table('songs').toCollection().modify(song => {
    if (song.audioUrl === undefined) {
      song.audioUrl = null
    }
  })
})

export { db }
