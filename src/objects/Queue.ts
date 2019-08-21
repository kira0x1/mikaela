import { QuickEmbed } from "../util/Style";
import { ISong } from "../db/dbSong";

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
