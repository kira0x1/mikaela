import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, VoiceChannel } from 'discord.js';

import { logger } from '../app';
import { addSongToServer } from '../database/api/serverApi';
import { QuickEmbed } from '../util/styleUtil';
import { Queue } from './Queue';

const minVolume: number = 0;
const maxVolume: number = 10;

export class Player {
   guild: Guild;
   queue: Queue;
   volume: number = 2.2;
   isPlaying: boolean = false;
   inVoice: boolean = false;
   stream: StreamDispatcher | undefined;
   voiceChannel: VoiceChannel | undefined;
   currentlyPlaying: ISong | undefined;
   client: Client;
   volumeDisabled: boolean = false;
   lastPlayed: ISong | undefined;
   ytdlHighWaterMark: number = 1 << 25
   vcHighWaterMark: number = 1 << 15

   constructor(guild: Guild, client: Client) {
      this.guild = guild;
      this.client = client;
      this.queue = new Queue();
   }

   async join(message: Message) {
      const vc = message.member.voice.channel;
      if (!vc) return logger.log('error', 'User not in voice');

      try {
         const conn = await vc.join();
         if (!conn) return;
         this.inVoice = true;
         this.voiceChannel = vc;
      } catch (err) {
         logger.log('error', err);
      }
   }

   changeVolume(amount: number, message?: Message) {
      if (this.volumeDisabled) return;

      if (amount < minVolume || amount > maxVolume) {
         if (message && amount < minVolume) {
            return QuickEmbed(
               message,
               `Cannot go below minimum volume ( **${minVolume}** )`
            );
         } else if (message && amount > maxVolume) {
            return QuickEmbed(
               message,
               `Cannot exceed maximum volume ( **${maxVolume}** )`
            );
         }
      }

      this.volume = amount;

      if (this.stream) {
         this.stream.setVolumeLogarithmic(this.volume / 10);
      }

      if (message) {
         QuickEmbed(message, `volume set to ${this.volume}`);
      }
   }

   getQueueCount(): number {
      return this.queue.songs.length;
   }

   leave() {
      this.clearQueue();
      this.isPlaying = false;
      this.currentlyPlaying = undefined;
      this.inVoice = false;

      try {
         if (this.voiceChannel) {
            this.voiceChannel.leave()
         }
      } catch (error) {
         console.warn(`Error trying to leave vc in guild ${this.guild.name}`)
      }
   }

   clearQueue() {
      this.queue.clear();
   }

   playNext() {
      if (this.currentlyPlaying) this.lastPlayed = this.currentlyPlaying;
      this.currentlyPlaying = this.queue.getNext();

      if (!this.lastPlayed) this.lastPlayed = this.currentlyPlaying;

      if (this.currentlyPlaying) {
         this.startStream(this.currentlyPlaying);
         return;
      }

      this.leave();
   }

   skipSong() {
      if (!this.stream) return;
      this.stream.end();
   }

   play(song: ISong, message: Message) {
      if (this.currentlyPlaying) return;

      this.currentlyPlaying = this.queue.getNext();
      const vc = message.member.voice.channel;

      if (!vc?.joinable)
         return QuickEmbed(message, 'I dont have permission to join that voice-channel');

      this.voiceChannel = vc;
      this.startStream(song);
   }

   getLastPlayed() {
      return this.lastPlayed;
   }

   async reload(message) {
      const currentSong = this.currentlyPlaying;
      const prevQueue = this.queue.songs;
      this.leave();
      this.play(currentSong, message);
      this.queue.songs = prevQueue;
   }

   async startStream(song: ISong) {
      if (!this.voiceChannel) {
         logger.log('error', 'No Voicechannel');
         return;
      }

      const opusStream = ytdl(song.url, {
         filter: 'audioonly',
         opusEncoded: true,
         highWaterMark: this.ytdlHighWaterMark,
         dlChunkSize: 0,
         encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
      })

      try {
         const conn = await this.voiceChannel.join();
         conn.voice.setSelfDeaf(true)

         this.stream = conn.play(opusStream, {
            highWaterMark: this.vcHighWaterMark,
            type: 'opus',
            volume: this.volume / 10
         })

         this.stream.setVolumeLogarithmic(this.volume / 10);

         this.isPlaying = true;
         // this.stream.on('finish', () => this.playNext());
         this.stream.on('speaking', (speaking) => {
            if (!speaking) this.playNext()
         })

      } catch (err) {
         logger.log('warn', err);
      }
   }

   async addSong(song: ISong, message: Message) {
      song.playedBy = message.member.id
      addSongToServer(this.guild, song)

      this.queue.addSong(song);
      this.play(song, message);
   }

   pause() {
      if (!(this.currentlyPlaying && this.stream)) return;
      if (!this.stream.paused) this.stream.pause(true);
   }

   unpause() {
      if (!(this.currentlyPlaying && this.stream)) return;
      if (this.stream.paused) this.stream.resume();
   }

   getStream() {
      return this.stream;
   }

   getSongAt(position: number): ISong {
      return this.queue.songs[position];
   }

   switchSongs(from: number, to: number) {
      const fromSong = this.getSongAt(from);
      const toSong = this.getSongAt(to);

      this.queue.songs[from] = toSong;
      this.queue.songs[to] = fromSong;
   }
}

export interface ISong {
   title: string;
   id: string;
   url: string;
   duration: IDuration;
   playedBy: string | undefined
}

export interface IDuration {
   seconds: string;
   minutes: string;
   hours: string;
   duration: string;
   totalSeconds: number
}
