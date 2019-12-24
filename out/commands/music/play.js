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
var discord_js_1 = require("discord.js");
var app_1 = require("../../app");
var API_1 = require("../../util/API");
var style_1 = require("../../util/style");
var config_1 = require("../../config");
var add_1 = require("../favorites/add");
var userController_1 = require("../../db/userController");
var ms_1 = __importDefault(require("ms"));
var heartEmoji;
function initEmoji(client) {
    var coders_club = client.guilds.get(config_1.coders_club_id);
    if (!coders_club)
        return;
    var emoji = coders_club.emojis.find(function (em) { return em.name === "heart"; });
    if (!emoji)
        return console.log("emoji not found");
    heartEmoji = emoji;
}
exports.initEmoji = initEmoji;
exports.command = {
    name: 'play',
    description: 'Play a song',
    aliases: ['p'],
    usage: "[song]",
    args: true,
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = args.join(" ");
                //Search for song
                API_1.GetSong(query).then(function (song) {
                    //Play song
                    PlaySong(message, song);
                }).catch(function (err) {
                    //If song not found, tell the user.
                    style_1.QuickEmbed(message, "Song not found");
                });
                return [2 /*return*/];
            });
        });
    }
};
function PlaySong(message, song) {
    return __awaiter(this, void 0, void 0, function () {
        var player, embed, msg, filter, collector;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    player = app_1.getPlayer(message);
                    if (!player)
                        return [2 /*return*/, console.log("couldnt find player")];
                    if (!song)
                        return [2 /*return*/, message.channel.send("Couldnt find song")
                            //Add the song to the player
                        ];
                    //Add the song to the player
                    player.addSong(song, message);
                    embed = new discord_js_1.RichEmbed()
                        .setAuthor(message.author.username, message.author.avatarURL)
                        .setTitle(song.title)
                        .setDescription("**Added to queue**\n" + song.duration.duration)
                        .setURL(song.url)
                        .setColor(style_1.embedColor);
                    return [4 /*yield*/, message.channel.send(embed)];
                case 1:
                    msg = _a.sent();
                    if (!(msg instanceof discord_js_1.Message)) return [3 /*break*/, 3];
                    return [4 /*yield*/, msg.react(heartEmoji)];
                case 2:
                    _a.sent();
                    filter = function (reaction, user) {
                        return reaction.emoji.name === heartEmoji.name && !user.bot;
                    };
                    collector = msg.createReactionCollector(filter, { time: ms_1.default("1h") });
                    collector.on("collect", function (reaction, reactionCollector) { return __awaiter(_this, void 0, void 0, function () {
                        var user, dbUser, iuser;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    user = reaction.users.last();
                                    return [4 /*yield*/, userController_1.getUser(user.id)];
                                case 1:
                                    dbUser = _a.sent();
                                    if (!!dbUser) return [3 /*break*/, 3];
                                    iuser = {
                                        username: user.username,
                                        tag: user.tag,
                                        id: user.id,
                                        favorites: [],
                                        roles: []
                                    };
                                    return [4 /*yield*/, userController_1.addUser(iuser)];
                                case 2:
                                    _a.sent();
                                    dbUser = iuser;
                                    _a.label = 3;
                                case 3:
                                    add_1.AddFavorite(dbUser, song, message);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    collector.on("end", function (collected) {
                        msg.clearReactions();
                    });
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.PlaySong = PlaySong;
