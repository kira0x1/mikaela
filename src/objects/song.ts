import { Message, RichEmbed, StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js";
import { ConvertDuration, ISong } from "../db/dbSong";
import { Youtube } from "../util/Api";
import { FavoritesHandler } from "../util/Emoji";
import { embedColor, QuickEmbed } from "../util/Style";
import { GetMessage } from "../util/MessageHandler";

import ytdl = require("ytdl-core");

//Get song by url
export async function GetSong(url: string): Promise<ISong | void> {
  let song: ISong | undefined = undefined;

  await ytdl
    .getInfo(url)
    .then(info => {
      song = ConvertInfo(info);
    })
    .catch(async () => {
      song = await Youtube.Get(url);
    });

  return song;
}

export function ConvertInfo(info: ytdl.videoInfo): ISong {
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
  isPlaying: boolean = false;

  //Queue
  queue: Queue = new Queue();

  public Stop() {
    this.LeaveVoice();
    this.queue.ClearQueue();
    this.isPlaying = false;
  }

  public RemoveSong(pos: number) {
    this.queue.RemoveSong(pos);
  }

  public async AddSong(query: string | ISong, message: Message) {
    let song: ISong | undefined | void = undefined;

    //Check if we are given a string or a song
    if (typeof query !== "string") song = query;
    else song = await GetSong(query);

    //If we couldnt find the song exit out
    if (!song) return QuickEmbed(`song not found`);

    //Then add the song to queue
    this.queue.AddSong(song);

    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)
      .setColor(embedColor);

    //Notify player their song is added
    const msgTemp = await message.channel.send(embed);
    let msg: undefined | Message = undefined;

    if (!Array.isArray(msgTemp)) msg = msgTemp;
    //Add favorites emoji
    if (msg) FavoritesHandler(msg, "heart", song);

    //If nothing is playing then play this song
    if (!this.isPlaying) this.Play(message);
  }

  //If no message given it will assume that the bot is already connected to voice
  public async Play(message: Message) {
    if (!message) console.error(`Message was not set`);
    //Check if is in voice, if not join
    if (!this.inVoice && message) await this.JoinVoice(message);

    if (this.queue.currentSong !== undefined) {
      this.isPlaying = true;
      this.stream = await this.connection.playStream(ytdl(this.queue.currentSong.url, { filter: "audioonly" }));
      this.stream.on("end", reason => this.OnSongEnd(reason));
    } else {
      console.error(`no song left to play`);
    }
  }

  //Skip song
  public async Skip() {
    if (this.stream) this.stream.end();
    else console.log(`Tried to skip when no stream exists`);
  }

  public async ListQueue(message: Message) {
    if (this.queue.songs.length === 0 && !this.queue.currentSong) return QuickEmbed(`Queue empty...`);

    let embed = new RichEmbed()
      .setTitle(`Playing: ${this.queue.currentSong.title}`)
      .setDescription(this.queue.currentSong.duration.duration)
      .setColor(embedColor);

    this.queue.songs.map((song, pos) => embed.addField(`${pos + 1}\n${song.title}`, song.url));
    message.channel.send(embed);
  }

  private async OnSongEnd(reason: string) {
    this.isPlaying = false;
    const song = this.queue.NextSong();
    if (song) return this.Play(GetMessage());
    else if (!song) this.LeaveVoice();
  }

  private async JoinVoice(message: Message) {
    this.voiceChannel = await message.member.voiceChannel;
    if (!this.voiceChannel) return QuickEmbed(`You must be in a voice channel`);
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
    this.isPlaying = false;
    this.inVoice = false;
    this.queue.ClearQueue();
  }
}

export class Queue {
  songs: ISong[] = [];
  currentSong: ISong | undefined = undefined;

  public NextSong() {
    this.currentSong = this.songs.shift();
    return this.currentSong;
  }

  public AddSong(song: ISong) {
    this.songs.push(song);
    if (this.currentSong === undefined) this.NextSong();
  }

  public ClearQueue() {
    this.songs = [];
    this.currentSong = undefined;
  }

  public RemoveSong(position: number) {
    const pos = Number(position) - 1;

    if (pos > this.songs.length || pos < 0) {
      return QuickEmbed(`Invalid position`);
    }

    const song = this.songs[pos];
    this.songs.splice(pos, 1);
    if (song) QuickEmbed(`Removed song **${song.title}**`);
    else QuickEmbed(`Invalid position`);
  }
}
