"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dbSong_1 = require("../db/dbSong");
const Api_1 = require("../util/Api");
const Style_1 = require("../util/Style");
const ytdl = require("ytdl-core");
const Emoji_1 = require("../util/Emoji");
//Get song by url
function GetSong(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let song = undefined;
        yield ytdl
            .getInfo(url)
            .then(info => {
            song = ConvertInfo(info);
        })
            .catch(() => __awaiter(this, void 0, void 0, function* () {
            song = yield Api_1.Youtube.Get(url);
        }));
        return song;
    });
}
exports.GetSong = GetSong;
function ConvertInfo(info) {
    return {
        title: info.title,
        id: info.video_id,
        url: info.video_url,
        duration: dbSong_1.ConvertDuration(info.length_seconds)
    };
}
exports.ConvertInfo = ConvertInfo;
class Player {
    constructor() {
        this.inVoice = false;
        this.isPlaying = false;
        this.volume = 4;
        //Queue
        this.queue = new Queue();
    }
    Stop() {
        this.LeaveVoice();
        this.queue.ClearQueue();
        this.isPlaying = false;
    }
    RemoveSong(message, pos) {
        this.queue.RemoveSong(message, pos);
    }
    AddSong(query, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let song = undefined;
            //Check if we are given a string or a song
            if (typeof query !== "string")
                song = query;
            else
                song = yield GetSong(query);
            //If we couldnt find the song exit out
            if (!song)
                return Style_1.QuickEmbed(message, `song not found`);
            //Then add the song to queue
            this.queue.AddSong(song);
            let embed = new discord_js_1.RichEmbed()
                .setTitle(song.title)
                .setDescription(`**Added to queue**\n${song.duration.duration}`)
                .setURL(song.url)
                .setColor(Style_1.embedColor);
            //Notify player their song is added
            const msgTemp = yield message.channel.send(embed);
            let msg = undefined;
            if (!Array.isArray(msgTemp))
                msg = msgTemp;
            //Add favorites emoji
            if (msg)
                Emoji_1.FavoritesHandler(msg, "heart", song);
            //If nothing is playing then play this song
            if (!this.isPlaying)
                this.Play(message);
        });
    }
    Play(message) {
        return __awaiter(this, void 0, void 0, function* () {
            //Check if is in voice, if not join
            if (!this.inVoice && message)
                yield this.JoinVoice(message);
            if (this.queue.currentSong !== undefined) {
                this.isPlaying = true;
                this.stream = yield this.connection.playStream(ytdl(this.queue.currentSong.url, { filter: "audioonly" }), { passes: 4 });
                this.stream.setVolumeLogarithmic(this.volume / 5);
                this.stream.on("end", reason => this.OnSongEnd(message, reason));
            }
            else {
                console.error(`no song left to play`);
            }
        });
    }
    Skip(message) {
        if (this.stream)
            this.stream.end();
        else
            console.log(`Tried to skip when no stream exists`);
    }
    ListQueue(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.songs.length === 0 && !this.queue.currentSong)
                return Style_1.QuickEmbed(message, `Queue empty...`);
            let embed = new discord_js_1.RichEmbed()
                .setTitle(`Playing: ${this.queue.currentSong.title}`)
                .setDescription(this.queue.currentSong.duration.duration)
                .setColor(Style_1.embedColor);
            this.queue.songs.map((song, pos) => embed.addField(`${pos + 1}\n${song.title}`, song.url));
            message.channel.send(embed);
        });
    }
    OnSongEnd(message, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isPlaying = false;
            const song = this.queue.NextSong();
            if (song)
                return this.Play(message);
            else if (!song)
                this.LeaveVoice();
        });
    }
    JoinVoice(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this.voiceChannel = message.member.voiceChannel;
            if (!this.voiceChannel)
                return Style_1.QuickEmbed(message, `You must be in a voice channel`);
            if (!this.voiceChannel.joinable) {
                this.inVoice = false;
                return Style_1.QuickEmbed(message, `Can't join that voicechannel`);
            }
            yield this.voiceChannel
                .join()
                .then(conn => {
                this.connection = conn;
                this.inVoice = true;
            })
                .catch(() => {
                this.inVoice = false;
            });
        });
    }
    LeaveVoice() {
        if (!this.voiceChannel)
            return;
        this.voiceChannel.leave();
        this.isPlaying = false;
        this.inVoice = false;
        this.queue.ClearQueue();
    }
}
exports.Player = Player;
class Queue {
    constructor() {
        this.songs = [];
        this.currentSong = undefined;
    }
    NextSong() {
        this.currentSong = this.songs.shift();
        return this.currentSong;
    }
    AddSong(song) {
        this.songs.push(song);
        if (this.currentSong === undefined)
            this.NextSong();
    }
    ClearQueue() {
        this.songs = [];
        this.currentSong = undefined;
    }
    RemoveSong(message, position) {
        const pos = Number(position) - 1;
        if (pos > this.songs.length || pos < 0) {
            return Style_1.QuickEmbed(message, `Invalid position`);
        }
        const song = this.songs[pos];
        this.songs.splice(pos, 1);
        if (song)
            Style_1.QuickEmbed(message, `Removed song **${song.title}**`);
        else
            Style_1.QuickEmbed(message, `Invalid position`);
    }
}
exports.Queue = Queue;
