import Dexie, { type EntityTable } from 'dexie'
import type { Song } from '@/types'

const db = new Dexie('lyribox-db') as Dexie & {
  songs: EntityTable<Song, 'id'>
}

db.version(1).stores({
  songs: 'id',
})

export { db }
