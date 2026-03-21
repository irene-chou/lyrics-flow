import Dexie, { type EntityTable } from 'dexie'
import type { Song } from '@/types'

const db = new Dexie('lyribox-db') as Dexie & {
  songs: EntityTable<Song, 'id'>
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

export { db }
