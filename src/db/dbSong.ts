import { Collection } from "discord.js"
import { Schema } from "mongoose"
import { conn } from "./dbSetup"

const songs = new Collection()

export interface ISong {
  title: string
  id: string
  url: string
  duration: IDuration
}

export interface IDuration {
  seconds: string
  minutes: string
  hours: string
  duration: string
}

export function ConvertDuration(duration_seconds: number | string) {
  let minutes: number = Math.floor(Number(duration_seconds) / 60)
  let seconds: number | string = Math.floor(Number(duration_seconds) - minutes * 60)
  let hours = Math.floor(minutes / 60)

  if (seconds < 10) seconds = "0" + seconds

  const duration: IDuration = {
    seconds: seconds.toString(),
    minutes: minutes.toString(),
    hours: hours.toString(),
    duration: `${minutes}:${seconds}`
  }

  return duration
}

const SongSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true, unique: false },
  url: { type: String, required: true, unique: false },
  duration: {
    seconds: String,
    minutes: String,
    hours: String,
    duration: String
  },
  created: {
    type: Date,
    default: Date.now()
  }
})

export async function FindSong(id: string) {
  if (!conn) return console.error(`Mongo connection undefined`)
  var songsModel = await conn.model("songs", SongSchema)
  return await songsModel.findOne({ id: id })
}

export async function initSongs() {
  if (!conn) return console.error(`Mongo connection undefined`)
  var songsModel = await conn.model("songs", SongSchema)
  const songsDb = await songsModel.find()
  songsDb.map(s => songs.set(s.id, s))
}

export async function CreateSong(title: string, id: string, url: string, duration: IDuration) {
  if (!conn) return console.error(`Mongo connection undefined`)
  var songsModel = await conn.model("songs", SongSchema)
  const songFound = await FindSong(id)

  if (!songFound || songFound === null)
    return await songsModel.create({
      id: id,
      title: title,
      url: url,
      duration: duration
    })
}
