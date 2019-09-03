"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var dbSong_1 = require("../db/dbSong");
var Api_1 = require("../util/Api");
var Emoji_1 = require("../util/Emoji");
var Style_1 = require("../util/Style");
var ytdl = require("ytdl-core");
//Get song by url
function GetSong(url) {
    return __awaiter(this, void 0, void 0, function () {
        var song;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    song = undefined;
                    return [4 /*yield*/, ytdl
                            .getInfo(url)
                            .then(function (info) {
                            song = ConvertInfo(info);
                        })
                            .catch(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Api_1.Youtube.Get(url)];
                                    case 1:
                                        song = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, song];
            }
        });
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
var Player = /** @class */ (function () {
    function Player() {
        this.inVoice = false;
        this.isPlaying = false;
        //Queue
        this.queue = new Queue();
    }
    Player.prototype.Stop = function () {
        this.LeaveVoice();
        this.queue.ClearQueue();
        this.isPlaying = false;
    };
    Player.prototype.RemoveSong = function (pos) {
        this.queue.RemoveSong(pos);
    };
    Player.prototype.AddSong = function (query, message) {
        return __awaiter(this, void 0, void 0, function () {
            var song, embed, msgTemp, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        song = undefined;
                        if (!(typeof query !== "string")) return [3 /*break*/, 1];
                        song = query;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, GetSong(query)];
                    case 2:
                        song = _a.sent();
                        _a.label = 3;
                    case 3:
                        //If we couldnt find the song exit out
                        if (!song)
                            return [2 /*return*/, Style_1.QuickEmbed("song not found")];
                        //Then add the song to queue
                        this.queue.AddSong(song);
                        embed = new discord_js_1.RichEmbed()
                            .setTitle(song.title)
                            .setDescription("**Added to queue**\n" + song.duration.duration)
                            .setURL(song.url)
                            .setColor(Style_1.embedColor);
                        return [4 /*yield*/, message.channel.send(embed)];
                    case 4:
                        msgTemp = _a.sent();
                        msg = undefined;
                        if (!Array.isArray(msgTemp))
                            msg = msgTemp;
                        //Add favorites emoji
                        if (msg)
                            Emoji_1.FavoritesHandler(msg, "heart", song);
                        //If nothing is playing then play this song
                        if (!this.isPlaying)
                            this.Play(message);
                        return [2 /*return*/];
                }
            });
        });
    };
    //If no message given it will assume that the bot is already connected to voice
    Player.prototype.Play = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(!this.inVoice && message)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.JoinVoice(message)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!(this.queue.currentSong !== undefined)) return [3 /*break*/, 4];
                        this.isPlaying = true;
                        _a = this;
                        return [4 /*yield*/, this.connection.playStream(ytdl(this.queue.currentSong.url, { filter: "audioonly" }))];
                    case 3:
                        _a.stream = _b.sent();
                        this.stream.on("end", function (reason) { return _this.OnSongEnd(reason); });
                        return [3 /*break*/, 5];
                    case 4:
                        console.error("no song left to play");
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.Skip = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.stream)
                    this.stream.end();
                else
                    console.log("Tried to skip when no stream exists");
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.ListQueue = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var embed;
            return __generator(this, function (_a) {
                if (this.queue.songs.length === 0 && !this.queue.currentSong)
                    return [2 /*return*/, Style_1.QuickEmbed("Queue empty...")];
                embed = new discord_js_1.RichEmbed()
                    .setTitle("Playing: " + this.queue.currentSong.title)
                    .setDescription(this.queue.currentSong.duration.duration)
                    .setColor(Style_1.embedColor);
                this.queue.songs.map(function (song, pos) { return embed.addField(pos + 1 + "\n" + song.title, song.url); });
                message.channel.send(embed);
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.OnSongEnd = function (reason) {
        return __awaiter(this, void 0, void 0, function () {
            var song;
            return __generator(this, function (_a) {
                this.isPlaying = false;
                song = this.queue.NextSong();
                if (song)
                    return [2 /*return*/, this.Play()];
                else if (!song)
                    this.LeaveVoice();
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.JoinVoice = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.voiceChannel = message.member.voiceChannel;
                        if (!this.voiceChannel)
                            return [2 /*return*/, Style_1.QuickEmbed("You must be in a voice channel")];
                        if (!this.voiceChannel.joinable) {
                            this.inVoice = false;
                            return [2 /*return*/, Style_1.QuickEmbed("Can't join that voicechannel")];
                        }
                        return [4 /*yield*/, this.voiceChannel
                                .join()
                                .then(function (conn) {
                                _this.connection = conn;
                                _this.inVoice = true;
                            })
                                .catch(function () {
                                _this.inVoice = false;
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.LeaveVoice = function () {
        if (!this.voiceChannel)
            return;
        this.voiceChannel.leave();
        this.isPlaying = false;
        this.inVoice = false;
        this.queue.ClearQueue();
    };
    return Player;
}());
exports.Player = Player;
var Queue = /** @class */ (function () {
    function Queue() {
        this.songs = [];
        this.currentSong = undefined;
    }
    Queue.prototype.NextSong = function () {
        this.currentSong = this.songs.shift();
        return this.currentSong;
    };
    Queue.prototype.AddSong = function (song) {
        this.songs.push(song);
        if (this.currentSong === undefined)
            this.NextSong();
    };
    Queue.prototype.ClearQueue = function () {
        this.songs = [];
        this.currentSong = undefined;
    };
    Queue.prototype.RemoveSong = function (position) {
        var pos = Number(position) - 1;
        if (pos > this.songs.length || pos < 0) {
            return Style_1.QuickEmbed("Invalid position");
        }
        var song = this.songs[pos];
        this.songs.splice(pos, 1);
        if (song)
            Style_1.QuickEmbed("Removed song **" + song.title + "**");
        else
            Style_1.QuickEmbed("Invalid position");
    };
    return Queue;
}());
exports.Queue = Queue;
