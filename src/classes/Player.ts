import chalk from 'chalk';
import { Client, Guild, Message, StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js';

import { QuickEmbed } from '../util/Style';

const ytdl = require('ytdl-core-discord');

const minVolume: number = 0;
const maxVolume: number = 6;

export class Player {
    guild: Guild;
    queue: Queue;
    volume: number = 3;
    isPlaying: boolean = false;
    inVoice: boolean = false;
    stream: StreamDispatcher | undefined;
    voiceChannel: VoiceChannel | undefined;
    connection: VoiceConnection | undefined;
    currentlyPlaying: ISong | undefined;
    client: Client;
    lastPlayed: ISong | undefined;

    constructor(guild: Guild, client: Client) {
        this.guild = guild;
        this.client = client;
        this.queue = new Queue();
    }

    async join(message: Message) {
        const vc = message.member.voice.channel;
        if (!vc) return console.error('User not in voice');

        vc.join()
            .then(conn => {
                conn.on('debug', console.log);
                this.connection = conn;
                this.inVoice = true;
                this.voiceChannel = vc;
            })
            .catch(err => {
                console.error(err);
            });
    }

    changeVolume(amount: number, message?: Message) {
        if (amount < minVolume || amount > maxVolume) {
            if (message && amount < minVolume) {
                return QuickEmbed(message, `Cannot go below minimum volume ( **${minVolume}** )`);
            } else if (message && amount > maxVolume) {
                return QuickEmbed(message, `Cannot exceed maximum volume ( **${maxVolume}** )`);
            }
        }

        this.volume = amount;

        if (this.stream) {
            this.stream.setVolumeLogarithmic(this.volume / 5);
        }

        if (message) {
            QuickEmbed(message, `volume set to ${this.volume}`);
        }
    }

    leave() {
        if (!this.inVoice) {
            const bot = this.guild.members.cache.get(this.client.user.id);
            if (bot) {
                if (bot.voice.channel) {
                    bot.voice.channel.leave();
                }
            }
        } else {
            if (this.voiceChannel) {
                this.unpause();
                this.voiceChannel.leave();
            }
        }
        this.clearQueue();
        this.currentlyPlaying = undefined;
        this.inVoice = false;
    }

    clearQueue() {
        // console.log(chalk.bgRed.bold("Clearing Queue"))
        this.queue.clear();
    }

    async playNext() {
        this.lastPlayed = this.currentlyPlaying;
        this.currentlyPlaying = this.queue.getNext();

        if (this.currentlyPlaying) {
            if (this.currentlyPlaying) this.startStream(this.currentlyPlaying);
        } else {
            this.leave();
        }
    }

    skipSong() {
        if (!this.stream) return;
        this.stream.end();
    }

    play(song: ISong, message: Message) {
        if (!this.currentlyPlaying) {
            this.currentlyPlaying = this.queue.getNext();
            const vc = message.member.voice.channel;
            this.voiceChannel = vc;
            this.startStream(song);
        }
    }

    getLastPlayed() {
        return this.lastPlayed;
    }

    startStream(song: ISong) {
        if (!this.voiceChannel) {
            return console.log('No Voicechannel');
        }

        this.voiceChannel.join().then(async vc => {
            this.stream = vc.play(await ytdl(song.url, { filter: 'audioonly' }), { type: 'opus' });
            this.stream.on('error', error => console.log(chalk.bgRed.bold(`STREAM ERROR\n${error}`)));
            this.stream.setVolumeLogarithmic(this.volume / 5);
            this.stream.on('finish', () => {
                this.playNext();
            });
        });
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
