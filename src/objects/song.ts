import { ConvertDuration, ISong } from "../db/dbSong"
import { Youtube } from "../util/Api"
import { QuickEmbed } from "../util/Style"

import ytdl = require("ytdl-core")

//Get song by url
export async function GetSong(url: string): Promise<ISong | void> {
  let song: ISong | undefined = undefined

  await ytdl
    .getInfo(url)
    .then(info => {
      song = ConvertInfo(info)
    })
    .catch(async () => {
      song = await Youtube.Get(url)
    })

  return song
}

export function ConvertInfo(info: ytdl.videoInfo): ISong {
  return {
    title: info.title,
    id: info.video_id,
    url: info.video_url,
    duration: ConvertDuration(info.length_seconds)
  }
}

export class Queue {
  songs: ISong[] = []
  currentSong: ISong | undefined = undefined

  public NextSong() {
    this.currentSong = this.songs.shift()
    return this.currentSong
  }

  public AddSong(song: ISong) {
    this.songs.push(song)
    if (this.currentSong === undefined) this.NextSong()
  }

  public ClearQueue() {
    this.songs = []
    this.currentSong = undefined
  }

  public RemoveSong(position: number) {
    const pos = Number(position) - 1

    if (pos > this.songs.length || pos < 0) {
      return QuickEmbed(`Invalid position`)
    }

    const song = this.songs[pos]
    this.songs.splice(pos, 1)
    if (song) QuickEmbed(`Removed song **${song.title}**`)
    else QuickEmbed(`Invalid position`)
  }
}
