import chalk from 'chalk';
import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, VoiceChannel } from 'discord.js';
import ms from 'ms';

import { logger } from '../app';
import { addSongToServer } from '../database/api/serverApi';
import { QuickEmbed } from '../util/styleUtil';
import { Queue } from './Queue';
import { Song } from './Song';
import { args, coders_club_id, isProduction } from '../config';

const minVolume: number = 0.05;
const maxVolume: number = 10;
const vcWaitTime: number = ms('1m')

const testVoiceID = '610883901472243713'

export class Player {
   guild: Guild;
   queue: Queue;
   volume: number = 2;
   isPlaying: boolean = false;
   inVoice: boolean = false;
   stream: StreamDispatcher | undefined;
   voiceChannel: VoiceChannel | undefined;
   currentlyPlaying: Song | undefined;
   client: Client;
   volumeDisabled: boolean = false;
   lastPlayed: Song | undefined;
   ytdlHighWaterMark: number = 1 << 25
   vcHighWaterMark: number = 1 << 15
   currentlyPlayingStopTime: number = 0
   vcTimeout: NodeJS.Timeout
   joinTestVc: boolean = false
   testVc?: VoiceChannel

   constructor(guild: Guild, client: Client) {
      this.guild = guild;
      this.client = client;
      this.queue = new Queue();


      if (guild.id !== coders_club_id) return
      this.joinTestVc = args['testvc']

      if (this.joinTestVc) {
         const vc = guild.channels.cache.get(testVoiceID)
         if (vc instanceof VoiceChannel) this.testVc = vc;
      }
   }

   async join(message: Message) {
      const vc = this.joinTestVc ? this.testVc : message.member.voice.channel;

      if (!vc) return QuickEmbed(message, `You must be in a voice channel to play music`);
      if (!vc.joinable) return QuickEmbed(message, 'I dont have permission to join that voice-channel');

      try {
         const conn = await vc.join();
         if (!conn) return;
         this.inVoice = true;
         this.voiceChannel = vc;
         this.startVcTimeout()
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
      this.isPlaying = false;
      this.inVoice = false;

      try {
         if (this.voiceChannel) {
            if (this.stream && this.currentlyPlaying) {
               this.queue.songs = [this.currentlyPlaying, ...this.queue.songs]
               this.currentlyPlaying = undefined
               this.currentlyPlayingStopTime = (this.stream.streamTime - this.stream.pausedTime) / 1000
            } else {
               this.currentlyPlayingStopTime = 0
            }

            this.clearVoiceTimeout()
            this.voiceChannel.leave()
         }
      } catch (error) {
         logger.warn(`Error trying to leave vc in: ${this.guild.name}`)
      }
   }

   clearQueue() {
      this.currentlyPlaying = undefined
      this.currentlyPlayingStopTime = 0
      this.queue.clear();
      this.startVcTimeout()
   }

   playNext() {
      if (this.currentlyPlaying) this.lastPlayed = this.currentlyPlaying;
      this.currentlyPlaying = this.queue.getNext();

      if (!this.lastPlayed) this.lastPlayed = this.currentlyPlaying;

      if (this.currentlyPlaying) {
         this.startStream(this.currentlyPlaying);
         return;
      }

      // if no songs next then start timeout
      this.startVcTimeout()
   }

   async startVcTimeout() {
      if (!isProduction)
         logger.info(chalk.bgMagenta.bold(`Starting vc timeout: ${ms(vcWaitTime, { long: true })}`))

      this.currentlyPlayingStopTime = 0
      this.clearVoiceTimeout()

      this.isPlaying = false
      this.vcTimeout = setTimeout(() => {
         this.onVcTimeout()
      }, vcWaitTime);
   }

   onVcTimeout() {
      if (!this.voiceChannel) {
         if (this.vcTimeout) {
            clearTimeout(this.vcTimeout)
         }

         this.vcTimeout = undefined
         return;
      }

      if (!isProduction)
         logger.info(chalk.bgMagenta.bold(`leaving vc after timeout`))
      this.leave()
   }

   clearVoiceTimeout() {
      if (this.vcTimeout) clearTimeout(this.vcTimeout)
   }

   skipSong() {
      if (!this.stream) return;
      this.stream.end();
   }

   play(song: Song, message: Message, seek?: number) {
      if (this.currentlyPlaying) return;

      this.currentlyPlaying = this.queue.getNext();
      const vc = this.joinTestVc ? this.testVc : message.member.voice.channel;

      if (!vc?.joinable)
         return QuickEmbed(message, 'I dont have permission to join that voice-channel');

      this.voiceChannel = vc;
      if (!this.isPlaying)
         this.startStream(song, seek);
   }

   getLastPlayed() {
      return this.lastPlayed;
   }

   async startStream(song: Song, seek?: number) {
      this.clearVoiceTimeout()

      if (!this.voiceChannel) {
         logger.log('error', 'No Voicechannel');
         return;
      }

      const ytdlOptions: any = {
         filter: 'audioonly',
         opusEncoded: true,
         highWaterMark: this.ytdlHighWaterMark,
         dlChunkSize: 0
      }

      if (seek && seek > 0) ytdlOptions.seek = seek

      const opusStream = ytdl(song.url, ytdlOptions)

      try {
         const conn = await this.voiceChannel.join();
         conn.voice.setSelfDeaf(true)

         this.stream = conn.play(opusStream, {
            highWaterMark: this.vcHighWaterMark,
            type: 'opus',
            bitrate: 128,
         })

         this.stream.setVolumeLogarithmic(this.volume / 10);

         this.isPlaying = true;

         this.stream.on('speaking', (speaking) => {
            if (!speaking) this.playNext()
         })

         this.stream.on('error', (err) => {
            logger.error(err)
         })

      } catch (err) {
         logger.log('warn', err);
      }
   }

   async resumeQueue(message: Message) {
      this.play(this.currentlyPlaying || this.queue.songs[0], message, this.currentlyPlayingStopTime)
   }

   async addSong(song: Song, message: Message) {
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

   getSongAt(position: number): Song {
      return this.queue.songs[position];
   }

   switchSongs(from: number, to: number) {
      const fromSong = this.getSongAt(from);
      const toSong = this.getSongAt(to);

      this.queue.songs[from] = toSong;
      this.queue.songs[to] = fromSong;
   }

   hasSongs() {
      return this.queue.hasSongs()
   }

   getSongs() {
      return this.queue.songs
   }
}
