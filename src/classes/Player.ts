import {
   AudioPlayer,
   AudioPlayerStatus,
   AudioResource,
   createAudioPlayer,
   createAudioResource,
   entersState,
   getVoiceConnection,
   joinVoiceChannel,
   VoiceConnectionStatus
} from '@discordjs/voice';
import { Client, Guild, Message } from 'discord.js';
import ms from 'ms';
import progressbar from 'string-progressbar';
import ytdl, { getInfo } from 'ytdl-core';
import { isProduction } from '../config';
import { bannedChannels } from '../database/api/serverApi';
import { logger } from '../system';
import { quickEmbed } from '../util';
import { Queue } from './Queue';
import { Song } from './Song';

const minVolume = 0;
const maxVolume = 12;
const vcWaitTime: number = ms('30m');

export class Player {
   public guild: Guild;
   public queue: Queue;
   public volume = 3.2;
   public isPlaying = false;
   public inVoice = false;
   public currentlyPlaying: Song | undefined;
   public client: Client;
   public player: AudioPlayer;
   public volumeDisabled = false;
   public lastPlayed: Song | undefined;
   public ytdlHighWaterMark: number = 1 << 30;
   public vcHighWaterMark = 1;
   public seekTime = 0;

   // eslint-disable-next-line no-undef
   public vcTimeout: NodeJS.Timeout;

   private resource: AudioResource;

   constructor(guild: Guild, client: Client) {
      this.guild = guild;
      this.client = client;
      this.queue = new Queue();
   }

   join(message: Message) {
      const vc = message.member.voice.channel;

      if (!vc) {
         quickEmbed(message, `You must be in a voice channel to play music`);
         return;
      }

      if (!vc.joinable) {
         quickEmbed(message, 'I dont have permission to join that voice-channel');
         return;
      }

      if (bannedChannels.get(message.guild.id)?.find(c => c.id === vc.id)) {
         quickEmbed(message, `The voice channel ${vc.name} has been blocked for use by a moderator`);
         return;
      }

      try {
         joinVoiceChannel({
            channelId: message.member.voice.channelId,
            guildId: message.guildId,
            adapterCreator: vc.guild.voiceAdapterCreator
         });
      } catch (err: any) {
         logger.error(`Error on joining\n${err.stack}`);
      }
   }

   setVolume(amount: number, message?: Message) {
      if (this.volumeDisabled) return;

      if (amount < minVolume || amount > maxVolume) {
         if (message && amount < minVolume) {
            return quickEmbed(message, `Cannot go below minimum volume ( **${minVolume}** )`);
         } else if (message && amount > maxVolume) {
            return quickEmbed(message, `Cannot exceed maximum volume ( **${maxVolume}** )`);
         }
      }

      this.volume = amount;

      if (this.resource) {
         this.resource.volume.setVolumeLogarithmic(this.volume / 10);
      }

      if (message) {
         quickEmbed(message, `volume set to ${this.volume}`, { addDeleteCollector: true });
      }
   }

   getQueueCount(): number {
      return this.queue.songs.length;
   }

   leave() {
      this.inVoice = false;

      try {
         this.saveQueueState();
         this.clearVoiceTimeout();

         if (this.isPlaying) {
            this.player.stop();
            this.isPlaying = false;
         }

         const connection = getVoiceConnection(this.guild.id);
         this.player?.stop();
         connection?.destroy();
         this.queue.clear();
      } catch (error) {
         logger.warn(`Error trying to leave vc in: ${this.guild.name}`);
         logger.error(error);
      }
   }

   stopPlayer() {
      try {
         this.clearVoiceTimeout();

         if (this.isPlaying) {
            this.player?.stop();
            this.isPlaying = false;
         }
      } catch (error) {
         logger.error(error);
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
         this.isPlaying = false;
         this.startStream(this.currentlyPlaying);
         return;
      }

      // if no songs next then start timeout
      this.stopPlayer();
      if (!this.vcTimeout) this.startVcTimeout();
   }

   async startVcTimeout() {
      if (!isProduction) logger.info(`Starting vc timeout: ${ms(vcWaitTime, { long: true })}`);

      this.clearVoiceTimeout();

      this.vcTimeout = setTimeout(() => {
         this.onVcTimeout();
      }, vcWaitTime);
   }

   onVcTimeout() {
      if (!this.guild) return;
      const connection = getVoiceConnection(this.guild.id);

      if (!connection) {
         if (this.vcTimeout) {
            clearTimeout(this.vcTimeout);
         }

         this.vcTimeout = undefined;
         return;
      }

      if (!isProduction) logger.info(`leaving vc after timeout`);
      this.leave();
   }

   clearVoiceTimeout() {
      if (this.vcTimeout) clearTimeout(this.vcTimeout);
   }

   skipSong() {
      this.playNext();
   }

   async play(song: Song, message: Message) {
      if (this.currentlyPlaying) return;
      this.join(message);
      this.currentlyPlaying = this.queue.getNext();
      if (!this.isPlaying) this.startStream(song);
   }

   getLastPlayed() {
      return this.lastPlayed;
   }

   // Returns stream time + seek time + paused time
   getStreamTime(): number {
      const resource = this.resource;
      if (!resource) return 0;

      const duration = this.resource.playbackDuration;
      return duration / 1000;
   }

   // Returns string representation of the current songs duration
   async getProgressBar(): Promise<string> {
      if (!this.currentlyPlaying || !this.currentlyPlaying.duration) return;

      const streamTime = this.getStreamTime();

      const duration = this.currentlyPlaying.duration;
      let total = duration.totalSeconds;

      if (!total) {
         const song = await getInfo(this.currentlyPlaying.url);
         total = Number(song.videoDetails.lengthSeconds);
         this.currentlyPlaying.duration.totalSeconds = total;
      }

      const current = streamTime || 0.01;

      if (!current || !total) {
         logger.warn(`failed to create progressbar\ncurrent: ${current}, total: ${total}`);
         return '';
      }

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

   async startStream(song: Song) {
      const connection = getVoiceConnection(this.guild.id);

      try {
         const opusStream = ytdl(song.url, {
            filter: 'audioonly',
            highWaterMark: this.ytdlHighWaterMark,
            dlChunkSize: 0,
            quality: 'highestaudio'
         });

         if (!this.player) this.player = createAudioPlayer();
         if (!this.isPlaying) {
            this.resource = createAudioResource(opusStream, {
               inlineVolume: true,
               metadata: { title: song.title }
            });

            this.setVolume(this.volume);
            await entersState(connection, VoiceConnectionStatus.Ready, 5000);
            this.player.play(this.resource);
            connection.subscribe(this.player);
            this.isPlaying = true;
         }

         this.player.on(AudioPlayerStatus.Idle, () => {
            setTimeout(() => {
               if (this.player.state.status !== AudioPlayerStatus.Idle) return;
               this.playNext();
            }, ms('1s'));
         });

         this.player.on('error', error => {
            const metadata: any = error.resource.metadata;

            logger.error(`Player Error: ${error.message} with resource ${metadata.title}`);
         });
      } catch (error: any) {
         this.playNext();
         logger.error(error.stack);
      }
   }

   async resumeQueue(message: Message) {
      const song = this.currentlyPlaying || this.queue.songs[0];

      if (!song) {
         return;
      }

      this.play(song, message);
   }

   async addSong(song: Song, message: Message, onlyAddToQueue = false) {
      this.clearVoiceTimeout();
      this.queue.addSong(song);
      if (!onlyAddToQueue) this.play(song, message);
   }

   pause() {
      // if (!(this.currentlyPlaying && this.stream)) return;
      // if (!this.stream.paused) this.stream.pause(true);
   }

   unpause() {
      // if (!(this.currentlyPlaying && this.stream)) return;
      // if (this.stream.paused) this.stream.resume();
   }

   // seek(amount: number) {
   //    if (!(this.currentlyPlaying && this.stream)) return;
   //    const currentTime = this.getStreamTime();
   //    let seekAmount = currentTime + amount / 1000;
   //    if (seekAmount < 0) seekAmount = 0;

   //    this.startStream(this.currentlyPlaying, seekAmount);
   // }

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
