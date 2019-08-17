import { Message, RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';
import * as yt from 'ytdl-core';
import { ConvertDuration, ISong } from '../db/song';
import { Youtube } from '../util/Api';
import { FavoritesHandler } from '../util/Emoji';
import { GetMessage } from '../util/MessageHandler';
import { embedColor, QuickEmbed } from '../util/Style';


import ytdl = require("ytdl-core");
//Get song by url
export async function GetSong(url: string): Promise<ISong | void> {
  let song: ISong | undefined = undefined;

  await yt
    .getInfo(url)
    .then(info => {
      song = ConvertInfo(info);
    })
    .catch(async () => {
      song = await Youtube.Get(url)
    });

  return song;
}

export function ConvertInfo(info: yt.videoInfo): ISong {
  return {
    title: info.title,
    id: info.video_id,
    url: info.video_url,
    duration: ConvertDuration(info.length_seconds)
  };
}

export class Player {
  // play, pause, stop, rewind, forward, queue
  connection: VoiceConnection | undefined;
  stream: StreamDispatcher | undefined;
  voiceChannel: VoiceChannel | undefined;
  inVoice: boolean = false;

  //Queue
  queue: Queue = new Queue();

  public Stop() {
    this.LeaveVoice();
    this.queue.ClearQueue();
  }

  public async Play(query: string, message: Message) {

    //Get Song
    let song: ISong | undefined | void = await GetSong(query)

    //Check if found song
    if (!song) return QuickEmbed(`song not found`);

    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)
      .setColor(embedColor);

    //Notify player their song is added
    const msgTemp = await message.channel.send(embed)
    let msg: undefined | Message = undefined

    if (!Array.isArray(msgTemp))
      msg = msgTemp

    //Add favorites emoji 
    if (msg)
      FavoritesHandler(msg, 'heart', song)

    //Check if is in voice, if not join
    if (!this.inVoice && message) await this.JoinVoice(message);

    //Check if in voice and has connection
    if (!this.inVoice || !this.connection) return;

    //If song is undefined then play song
    if (this.queue.currentSong === undefined) {
      this.queue.AddSong(song);
      this.stream = this.connection.playStream(ytdl(song.url, { filter: "audioonly" }));
      this.stream.on("end", reason => this.OnSongEnd(reason));
      return;
    }

    //Add song to queue
    this.queue.AddSong(song);
  }

  public Skip() {
    this.OnSongEnd("skip");
  }

  public async ListQueue() {
    if (this.queue.songs.length === 0 || !this.queue.currentSong)
      return QuickEmbed(`Queue empty...`);

    let embed = new RichEmbed()
      .setTitle(`Playing: ${this.queue.currentSong.title}`)
      .setDescription(this.queue.currentSong.duration.duration)
      .setColor(embedColor);

    this.queue.songs.map((song, pos) =>
      embed.addField(`(${pos + 1})\n${song.title}`, song.url)
    );

    GetMessage().channel.send(embed);
  }

  private OnSongEnd(reason: string) {
    this.queue.NextSong();

    if (!this.connection || !this.queue.currentSong) return this.Stop();

    this.stream = this.connection.playStream(
      ytdl(this.queue.currentSong.url, { filter: "audioonly" })
    );
    this.stream.on("end", reason => this.OnSongEnd(reason));
  }

  private async JoinVoice(message: Message) {
    this.voiceChannel = message.member.voiceChannel;
    if (!this.voiceChannel) return QuickEmbed(`You must be in a voice channel`)
    if (!this.voiceChannel.joinable) {
      this.inVoice = false;
      return QuickEmbed(`Can't join that voicechannel`);
    }

    await this.voiceChannel
      .join()
      .then(conn => {
        this.connection = conn;
        this.inVoice = true;
      })
      .catch(() => {
        this.inVoice = false;
      });
  }

  private LeaveVoice() {
    if (!this.voiceChannel) return;
    this.voiceChannel.leave();
    this.inVoice = false;
  }
}

class Queue {
  songs: ISong[] = [];
  currentSong: ISong | undefined = undefined;

  public NextSong() {
    this.currentSong = this.songs.pop();
  }

  public AddSong(song: ISong) {
    this.songs.push(song);
    if (this.currentSong === undefined) this.currentSong = song;
  }

  public ClearQueue() {
    this.songs = [];
    this.currentSong = undefined;
  }
}
