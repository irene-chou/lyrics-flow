import Dexie, { type EntityTable } from 'dexie'
import type { Song, Folder } from '@/types'

const db = new Dexie('lyribox-db') as Dexie & {
  songs: EntityTable<Song, 'id'>
  folders: EntityTable<Folder, 'id'>
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
  folders: 'id',
}).upgrade(tx => {
  return tx.table('songs').toCollection().modify(song => {
    if (song.folderId === undefined) {
      song.folderId = null
    }
  })
})

export { db }
