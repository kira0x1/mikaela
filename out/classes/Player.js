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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ytdl_core_1 = __importDefault(require("ytdl-core"));
var chalk_1 = __importDefault(require("chalk"));
var style_1 = require("../util/style");
var passes = 5;
var minVolume = 0.5;
var maxVolume = 8;
var Player = /** @class */ (function () {
    function Player(guild, client) {
        this.volume = 5;
        this.isPlaying = false;
        this.inVoice = false;
        this.isPaused = false;
        this.guild = guild;
        this.client = client;
        this.queue = new Queue();
    }
    Player.prototype.join = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var vc;
            var _this = this;
            return __generator(this, function (_a) {
                vc = message.member.voiceChannel;
                if (!vc)
                    return [2 /*return*/, console.error("User not in voice")];
                vc.join().then(function (conn) {
                    _this.connection = conn;
                    _this.inVoice = true;
                    _this.voiceChannel = vc;
                }).catch(function (err) {
                    console.error(err);
                });
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.changeVolume = function (amount, message) {
        if (amount < minVolume || amount > maxVolume) {
            if (message && amount < minVolume) {
                return style_1.QuickEmbed(message, "Cannot go below minimum volume ( **" + minVolume + "** )");
            }
            else if (message && amount > maxVolume) {
                return style_1.QuickEmbed(message, "Cannot exceed maximum volume ( **" + maxVolume + "** )");
            }
        }
        this.volume = amount;
        if (this.stream) {
            this.stream.setVolumeLogarithmic(this.volume / 5);
        }
        if (message) {
            style_1.QuickEmbed(message, "volume set to " + this.volume);
        }
    };
    Player.prototype.leave = function () {
        if (!this.inVoice) {
            var bot = this.guild.members.get(this.client.user.id);
            if (bot) {
                if (bot.voiceChannel) {
                    bot.voiceChannel.leave();
                }
            }
        }
        else {
            if (this.voiceChannel) {
                this.unpause();
                this.voiceChannel.leave();
            }
        }
        this.clearQueue();
        this.currentlyPlaying = undefined;
        this.inVoice = false;
    };
    Player.prototype.clearQueue = function () {
        console.log(chalk_1.default.bgRed.bold("Clearing Queue"));
        this.queue.clear();
    };
    Player.prototype.playNext = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.currentlyPlaying = this.queue.getNext();
                if (this.currentlyPlaying) {
                    if (this.currentlyPlaying)
                        this.startStream(this.currentlyPlaying);
                }
                else {
                    this.leave();
                }
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.skipSong = function () {
        if (this.stream) {
            this.stream.end();
        }
        else {
            console.log("No Stream!");
        }
    };
    Player.prototype.play = function (song, message) {
        if (!this.currentlyPlaying) {
            this.currentlyPlaying = this.queue.getNext();
            var vc = message.member.voiceChannel;
            this.voiceChannel = vc;
            this.startStream(song);
        }
    };
    Player.prototype.startStream = function (song) {
        var _this = this;
        if (!this.voiceChannel) {
            return console.log("No Voicechannel");
        }
        this.voiceChannel.join().then(function (vc) {
            _this.stream = vc.playStream(ytdl_core_1.default(song.url, { filter: "audioonly" }), { passes: passes });
            _this.stream.setVolumeLogarithmic(_this.volume / 5);
            _this.stream.on('end', function () {
                _this.playNext();
            });
        });
    };
    Player.prototype.addSong = function (song, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.queue.addSong(song);
                this.play(song, message);
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.pause = function () {
        if (this.currentlyPlaying && this.stream) {
            try {
                this.stream.pause();
                this.isPaused = true;
                return true;
            }
            catch (err) {
                this.isPaused = false;
                console.log(chalk_1.default.bgRed.bold(err));
                return false;
            }
        }
    };
    Player.prototype.unpause = function () {
        if (this.currentlyPlaying && this.stream) {
            try {
                this.stream.resume();
                this.isPaused = false;
                return true;
            }
            catch (err) {
                console.log(chalk_1.default.bgRed.bold(err));
                return false;
            }
        }
        return false;
    };
    Player.prototype.getStream = function () {
        return this.stream;
    };
    return Player;
}());
exports.Player = Player;
var Queue = /** @class */ (function () {
    function Queue(songs) {
        this.songs = [];
        if (songs) {
            this.songs = songs;
        }
        else {
            this.songs = [];
        }
    }
    Queue.prototype.addSong = function (song) {
        this.songs.push(song);
    };
    Queue.prototype.getNext = function () {
        return this.songs.shift();
    };
    Queue.prototype.clear = function () {
        this.songs = [];
    };
    Queue.prototype.removeAt = function (index) {
        return this.songs.splice(index, 1);
    };
    Queue.prototype.shuffle = function () {
        var currentIndex = this.songs.length, tempValue, randomIndex;
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
    };
    return Queue;
}());
exports.Queue = Queue;
