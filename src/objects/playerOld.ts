import { Message, RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js"
import { ISong } from "../db/dbSong"
import { FavoritesHandler } from "../util/Emoji"
import { embedColor, QuickEmbed } from "../util/Style"
import { GetSong, Queue } from "./song"

const ytdl = require("ytdl-core")

export class Player {
  // play, pause, stop, rewind, forward, queue
  connection: VoiceConnection | undefined
  stream: StreamDispatcher | undefined
  voiceChannel: VoiceChannel | undefined
  inVoice: boolean = false
  isPlaying: boolean = false

  //Queue
  queue: Queue = new Queue()

  public Stop() {
    this.LeaveVoice()
    this.queue.ClearQueue()
    this.isPlaying = false
  }

  public RemoveSong(pos: number) {
    this.queue.RemoveSong(pos)
  }

  public async AddSong(query: string | ISong, message: Message) {
    let song: ISong | undefined | void = undefined

    //Check if we are given a string or a song
    if (typeof query !== "string") song = query
    else song = await GetSong(query)

    //If we couldnt find the song exit out
    if (!song) return QuickEmbed(`song not found`)

    //Then add the song to queue
    this.queue.AddSong(song)

    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)
      .setColor(embedColor)

    //Notify player their song is added
    const msgTemp = await message.channel.send(embed)
    let msg: undefined | Message = undefined

    if (!Array.isArray(msgTemp)) msg = msgTemp
    //Add favorites emoji
    if (msg) FavoritesHandler(msg, "heart", song)

    //If nothing is playing then play this song
    if (!this.isPlaying) this.Play(message)
  }

  public async Play(message: Message) {
    //Check if is in voice, if not join
    if (!this.inVoice && message) await this.JoinVoice(message)

    //Check if in voice and has connection
    if (!this.inVoice || !this.connection)
      return console.error(`connection error while trying to play music`)

    this.StreamSong()
  }

  async StreamSong() {
    if (this.queue.currentSong !== undefined) {
      this.isPlaying = true
      // this.stream.player.voiceConnection.playOpusStream(ytdl(this.queue.currentSong.url, { filter: "audioonly" }))

      this.stream = await this.connection.playStream(
        ytdl(this.queue.currentSong.url, { filter: "audioonly" })
      )
      this.stream.on("end", reason => this.OnSongEnd(reason))
    } else {
      console.error(`no song left to play`)
    }
  }

  public Skip() {
    if (this.stream) this.stream.end()
    else console.log(`Tried to skip when no stream exists`)
  }

  public async ListQueue(message: Message) {
    if (this.queue.songs.length === 0 && !this.queue.currentSong)
      return QuickEmbed(`Queue empty...`)

    let embed = new RichEmbed()
      .setTitle(`Playing: ${this.queue.currentSong.title}`)
      .setDescription(this.queue.currentSong.duration.duration)
      .setColor(embedColor)

    this.queue.songs.map((song, pos) => embed.addField(`${pos + 1}\n${song.title}`, song.url))
    message.channel.send(embed)
  }

  private async OnSongEnd(reason: string) {
    this.isPlaying = false
    const song = this.queue.NextSong()
    if (song) return this.StreamSong()
    else if (!song) this.LeaveVoice()
  }

  private async JoinVoice(message: Message) {
    this.voiceChannel = message.member.voiceChannel
    if (!this.voiceChannel) return QuickEmbed(`You must be in a voice channel`)
    if (!this.voiceChannel.joinable) {
      this.inVoice = false
      return QuickEmbed(`Can't join that voicechannel`)
    }

    await this.voiceChannel
      .join()
      .then(conn => {
        this.connection = conn
        this.inVoice = true
      })
      .catch(() => {
        this.inVoice = false
      })
  }

  private LeaveVoice() {
    if (!this.voiceChannel) return
    this.voiceChannel.leave()
    this.isPlaying = false
    this.inVoice = false
    this.queue.ClearQueue()
  }
}
