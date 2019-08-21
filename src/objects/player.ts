import { Collection, Guild, Message, RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import { embedColor, QuickEmbed } from "../util/Style";
import { Queue } from './Queue';

let volume = 5

const maxVolume = 7
const minVolume = 1


const ytdl = require("ytdl-core")

const players: Collection<Guild, Player> = new Collection()

class Player {
  stream: StreamDispatcher | undefined = undefined
  conn: VoiceConnection | undefined = undefined
  inVoice: boolean = false
  queue: Queue
  guild: Guild
  vc: VoiceChannel

  ChangeVolume(amount: number) {
    changeVolume(amount, this)
  }

  Play() { }

  Join(message: Message) {
    joinVoice(message, this)
  }
  Leave() {
    leaveVoice(this)
  }
  Skip(message: Message) {
    if (this.stream) this.stream.end()
    else console.log(`Tried to skip when no stream exists`)
  }
  ListQueue(message: Message) {
    if (this.queue.songs.length === 0 || !this.queue.currentSong)
      return QuickEmbed(`Queue empty...`)

    let embed = new RichEmbed()
      .setTitle(`Playing: ${this.queue.currentSong.title}`)
      .setDescription(this.queue.currentSong.duration.duration)
      .setColor(embedColor)

    this.queue.songs.map((song, pos) => embed.addField(`${pos + 1}\n${song.title}`, song.url))
    message.channel.send(embed)
  }

  private onSongEnd() {
    const nextSong = this.queue.NextSong()

    if (nextSong)
      return this.Play()

    this.Leave()
  }
}

function changeVolume(amount: number, player: Player) {
  volume += amount
  if (volume > maxVolume) volume = maxVolume
  else if (volume < minVolume) volume = minVolume
  if (player.stream) player.stream.setVolume(volume)
}

function joinVoice(message: Message, player: Player) {
  //get vc from user
  const vc = message.member.voiceChannel

  //Check if the voice channel exists
  if (!vc) return QuickEmbed(`you're not in a voice channel`)
  //Check if the we're able to join the voice channel
  else if (!vc.joinable) return QuickEmbed(`Cant join this voice channel`)

  //Join voice
  message.member.voiceChannel.join().then(connection => {
    player.conn = connection
    player.inVoice = true
  })
}

function leaveVoice(player: Player) {
  if (!player.vc) return

  player.guild.voiceConnection.channel.leave()
  player.inVoice = false
  player.vc = undefined
}