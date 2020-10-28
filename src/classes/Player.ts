import ytdl from 'discord-ytdl-core';
import { Client, Guild, Message, StreamDispatcher, VoiceChannel } from 'discord.js';
import { QuickEmbed } from '../util/styleUtil';


const minVolume: number = 0;
const maxVolume: number = 10;

export class Player {
   guild: Guild;
   queue: Queue;
   volume: number = 5;
   isPlaying: boolean = false;
   inVoice: boolean = false;
   stream: StreamDispatcher | undefined;
   voiceChannel: VoiceChannel | undefined;
   currentlyPlaying: ISong | undefined;
   client: Client;
   volumeDisabled: boolean = true;
   lastPlayed: ISong | undefined;

   constructor(guild: Guild, client: Client) {
      this.guild = guild;
      this.client = client;
      this.queue = new Queue();
   }

   async join(message: Message) {
      const vc = message.member.voice.channel;
      if (!vc) return console.error('User not in voice');

      try {
         const conn = await vc.join()
         if (!conn) return
         this.inVoice = true;
         this.voiceChannel = vc
      } catch (err) {
         console.error(err)
      }
   }

   changeVolume(amount: number, message?: Message) {
      if (this.volumeDisabled) return
      if (amount < minVolume || amount > maxVolume) {
         if (message && amount < minVolume) {
            return QuickEmbed(message, `Cannot go below minimum volume ( **${minVolume}** )`);
         } else if (message && amount > maxVolume) {
            return QuickEmbed(message, `Cannot exceed maximum volume ( **${maxVolume}** )`);
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
      this.currentlyPlaying = undefined;
      this.inVoice = false;
      this.voiceChannel?.leave()
   }

   clearQueue() {
      this.queue.clear();
   }

   playNext() {
      this.lastPlayed = this.currentlyPlaying;
      this.currentlyPlaying = this.queue.getNext();

      if (!this.lastPlayed) this.lastPlayed = this.currentlyPlaying

      if (this.currentlyPlaying) {
         this.startStream(this.currentlyPlaying);
         return
      }

      this.leave()
   }

   skipSong() {
      if (!this.stream) return;
      this.stream.end();
   }

   play(song: ISong, message: Message) {
      if (this.currentlyPlaying) return

      this.currentlyPlaying = this.queue.getNext();
      const vc = message.member.voice.channel;
      if (!vc.joinable) return QuickEmbed(message, "I dont have permission to join that voice-channel")
      this.voiceChannel = vc;
      this.startStream(song);
   }

   getLastPlayed() {
      return this.lastPlayed;
   }

   async reload(message) {
      const currentSong = this.currentlyPlaying;
      const prevQueue = this.queue.songs
      await this.leave();
      this.play(currentSong, message)
      this.queue.songs = prevQueue;
   }

   startStream(song: ISong) {

      if (!this.voiceChannel) {
         console.error('No Voicechannel');
         return;
      }

      const opusStream = ytdl(song.url, {
         filter: "audioonly",
         opusEncoded: true,
         highWaterMark: 50
      })

      this.voiceChannel.join().then(conn => {
         this.stream = conn.play(opusStream, {
            type: 'opus',
            volume: false
         })
      })
   }

   async addSong(song: ISong, message: Message) {
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
      return this.queue.songs[position]
   }

   switchSongs(from: number, to: number) {
      const fromSong = this.getSongAt(from)
      const toSong = this.getSongAt(to)

      this.queue.songs[from] = toSong
      this.queue.songs[to] = fromSong
   }
}

export class Queue {
   songs: Array<ISong> = [];

   constructor(songs?: Array<ISong>) {
      if (songs) {
         this.songs = songs;
      } else {
         this.songs = [];
      }
   }

   addSong(song: ISong) {
      this.songs.push(song);
   }

   getNext(): ISong | undefined {
      return this.songs.shift();
   }

   clear() {
      this.songs = [];
   }

   removeAt(index: number) {
      return this.songs.splice(index, 1);
   }

   shuffle() {
      let currentIndex = this.songs.length,
         tempValue,
         randomIndex;

      //While there are still elements to shuffle
      while (0 !== currentIndex) {
         //Pick a remaining element
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex -= 1;

         //Swap it with the current element;
         tempValue = this.songs[currentIndex];
         this.songs[currentIndex] = this.songs[randomIndex];
         this.songs[randomIndex] = tempValue;
      }
   }
}

export interface ISong {
   title: string;
   id: string;
   url: string;
   duration: IDuration;
}

export interface IDuration {
   seconds: string;
   minutes: string;
   hours: string;
   duration: string;
}
