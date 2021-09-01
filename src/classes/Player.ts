import chalk from 'chalk';
import ytdl, { getInfo } from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, VoiceChannel } from 'discord.js';
import ms from 'ms';

import { logger } from '../app';
import { quickEmbed } from '../util/styleUtil';
import { Queue } from './Queue';
import { Song } from './Song';
import { args, coders_club_id, isProduction } from '../config';
import progressbar from 'string-progressbar';
import { bannedChannels } from '../database/api/serverApi';

const minVolume = 0;
const maxVolume = 12;
const vcWaitTime: number = ms('30m');

const testVoiceID = '610883901472243713';

export class Player {
   public guild: Guild;
   public queue: Queue;
   public volume = 2.6;
   public isPlaying = false;
   public inVoice = false;
   public stream: StreamDispatcher | undefined;
   public voiceChannel: VoiceChannel | undefined;
   public currentlyPlaying: Song | undefined;
   public client: Client;
   public volumeDisabled = false;
   public lastPlayed: Song | undefined;
   public ytdlHighWaterMark: number = 1 << 30;
   public vcHighWaterMark = 1;
   public seekTime = 0;

   // eslint-disable-next-line no-undef
   public vcTimeout: NodeJS.Timeout;

   public joinTestVc = false;
   public testVc?: VoiceChannel;

   constructor(guild: Guild, client: Client) {
      this.guild = guild;
      this.client = client;
      this.queue = new Queue();

      if (guild.id !== coders_club_id) return;
      this.joinTestVc = args['testvc'];

      if (this.joinTestVc) {
         const vc = guild.channels.cache.get(testVoiceID);
         if (vc instanceof VoiceChannel) this.testVc = vc;
      }
   }

   async join(message: Message) {
      const vc = this.joinTestVc ? this.testVc : message.member.voice.channel;

      if (!vc) return quickEmbed(message, `You must be in a voice channel to play music`);
      if (!vc.joinable) return quickEmbed(message, 'I dont have permission to join that voice-channel');
      if (bannedChannels.get(message.guild.id)?.find(c => c.id === vc.id)) {
         return quickEmbed(message, `The voice channel ${vc.name} has been blocked for use by a moderator`);
      }

      try {
         const conn = await vc.join();
         if (!conn) return;
         this.inVoice = true;
         this.voiceChannel = vc;
         this.startVcTimeout();
      } catch (err) {
         logger.log('error', err);
      }
   }

   changeVolume(amount: number, message?: Message) {
      if (this.volumeDisabled) return;

      if (amount < minVolume || amount > maxVolume) {
         if (message && amount < minVolume) {
            return quickEmbed(message, `Cannot go below minimum volume ( **${minVolume}** )`);
         } else if (message && amount > maxVolume) {
            return quickEmbed(message, `Cannot exceed maximum volume ( **${maxVolume}** )`);
         }
      }

      this.volume = amount;

      if (this.stream) {
         this.stream.setVolumeLogarithmic(this.volume / 10);
      }

      if (message) {
         quickEmbed(message, `volume set to ${this.volume}`, { addDeleteCollector: true });
      }
   }

   getQueueCount(): number {
      return this.queue.songs.length;
   }

   leave() {
      this.isPlaying = false;
      this.inVoice = false;

      try {
         this.saveQueueState();
         this.clearVoiceTimeout();

         if (this.voiceChannel) {
            this.voiceChannel.leave();
         }

         this.queue.clear();
      } catch (error) {
         logger.warn(`Error trying to leave vc in: ${this.guild.name}`);
      }
   }

   saveQueueState() {
      if (!this.currentlyPlaying) return;
      this.queue.songs = [this.currentlyPlaying, ...this.queue.songs];
      this.currentlyPlaying = undefined;
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

      // if no songs next then start timeout
      this.isPlaying = false;
      if (!this.vcTimeout) this.startVcTimeout();
   }

   async startVcTimeout() {
      if (!isProduction)
         logger.info(chalk.bgMagenta.bold(`Starting vc timeout: ${ms(vcWaitTime, { long: true })}`));

      this.clearVoiceTimeout();

      this.vcTimeout = setTimeout(() => {
         this.onVcTimeout();
      }, vcWaitTime);
   }

   onVcTimeout() {
      if (!this.voiceChannel) {
         if (this.vcTimeout) {
            clearTimeout(this.vcTimeout);
         }

         this.vcTimeout = undefined;
         return;
      }

      if (!isProduction) logger.info(chalk.bgMagenta.bold(`leaving vc after timeout`));
      this.leave();
   }

   clearVoiceTimeout() {
      if (this.vcTimeout) clearTimeout(this.vcTimeout);
   }

   skipSong() {
      if (!this.stream) return;
      this.stream.end();
   }

   play(song: Song, message: Message) {
      if (this.currentlyPlaying) return;

      const vc = this.joinTestVc ? this.testVc : message.member.voice.channel;

      if (bannedChannels.get(message.guild.id)?.find(c => c.id === vc.id)) {
         this.leave();
         return quickEmbed(message, `The voice channel ${vc.name} has been blocked for use by a moderator`);
      }

      this.currentlyPlaying = this.queue.getNext();

      if (!vc?.joinable) return quickEmbed(message, 'I dont have permission to join that voice-channel');

      this.voiceChannel = vc;
      if (!this.isPlaying) this.startStream(song);
   }

   getLastPlayed() {
      return this.lastPlayed;
   }

   // Returns stream time + seek time + paused time
   getStreamTime(): number {
      const stream = this.stream;
      if (!stream) return 0;

      let streamTime = (stream.streamTime - stream.pausedTime) / 1000;
      streamTime += this.seekTime;
      return streamTime;
   }

   // Returns string representation of the current songs duration
   async getProgressBar(): Promise<string> {
      const streamTime = this.getStreamTime();

      const duration = this.currentlyPlaying.duration;
      let total = duration.totalSeconds;

      if (!total) {
         const song = await getInfo(this.currentlyPlaying.url);
         total = Number(song.videoDetails.lengthSeconds);
         this.currentlyPlaying.duration.totalSeconds = total;
      }

      const current = streamTime;
      const songBar = progressbar.splitBar(total, current, 20)[0];

      return songBar;
   }

   // Returns a string of how long the songs been playing / the total duration
   getDurationPretty(): string {
      const streamTime = this.getStreamTime();

      const minutes = Math.floor(streamTime / 60);

      let seconds: number | string = streamTime - minutes * 60;
      seconds = seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0);

      const duration = this.currentlyPlaying.duration;

      let prettyTime = minutes.toFixed(0) + ':' + seconds;

      return `${prettyTime} / ${duration.duration}`;
   }

   async startStream(song: Song, seek = 0) {
      this.seekTime = seek;
      if (!this.voiceChannel) {
         logger.error('No Voicechannel');
         return;
      }

      try {
         const opusStream = ytdl(song.url, {
            filter: 'audioonly',
            opusEncoded: true,
            highWaterMark: this.ytdlHighWaterMark,
            dlChunkSize: 0,
            quality: 'highestaudio',
            seek: seek
         });

         opusStream.on('error', error => {
            this.playNext();
            // logger.error(error.stack)
         });

         const conn = await this.voiceChannel.join();
         conn.voice.setSelfDeaf(true);

         this.stream = conn.play(opusStream, {
            highWaterMark: this.vcHighWaterMark,
            type: 'opus',
            bitrate: 'auto'
         });

         this.stream.setVolumeLogarithmic(this.volume / 10);

         this.isPlaying = true;

         this.stream.on('speaking', speaking => {
            if (!speaking) this.playNext();
         });

         this.stream.on('error', error => {
            this.playNext();
            logger.error(`stream error: ${error}`);
         });
      } catch (error) {
         logger.error(error.stack);
      }
   }

   async resumeQueue(message: Message) {
      this.play(this.currentlyPlaying || this.queue.songs[0], message);
   }

   async addSong(song: Song, message: Message, onlyAddToQueue = false) {
      this.clearVoiceTimeout();
      this.queue.addSong(song);
      if (!onlyAddToQueue) this.play(song, message);
   }

   pause() {
      if (!(this.currentlyPlaying && this.stream)) return;
      if (!this.stream.paused) this.stream.pause(true);
   }

   unpause() {
      if (!(this.currentlyPlaying && this.stream)) return;
      if (this.stream.paused) this.stream.resume();
   }

   seek(amount: number) {
      if (!(this.currentlyPlaying && this.stream)) return;
      const currentTime = this.getStreamTime();
      let seekAmount = currentTime + amount / 1000;
      if (seekAmount < 0) seekAmount = 0;

      this.startStream(this.currentlyPlaying, seekAmount);
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
      return this.queue.hasSongs();
   }

   getSongs() {
      return this.queue.songs;
   }
}
