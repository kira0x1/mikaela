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
var dbFavorites_1 = require("../db/dbFavorites");
var dbUser_1 = require("../db/dbUser");
var song_1 = require("../objects/song");
var MessageHandler_1 = require("../util/MessageHandler");
var Style_1 = require("../util/Style");
var music_1 = require("./music");
var ms = require("ms");
var flags = [
    { name: "list", aliases: ["ls", "l"] },
    { name: "add", aliases: ["a"] },
    { name: "play", aliases: ["p"] },
    { name: "info", aliases: ["i"] },
    { name: "remove", aliases: ["r"] }
];
exports.command = {
    name: "favorite",
    description: "Favorite songs",
    aliases: ["fav", "f"],
    flags: flags,
    cooldown: 3,
    execute: function (message, args) {
        message.channel.startTyping();
        var msg = args.shift() || "";
        if (msg === "")
            return;
        var flag = flags.find(function (f) { return f.name === msg || (f.aliases && f.aliases.includes(msg)); });
        if (flag) {
            switch (flag.name) {
                case "list":
                    ListFavorites(args);
                    break;
                case "add":
                    if (!args || (args && args.length === 0))
                        return Style_1.QuickEmbed("no songs given");
                    AddSong(args);
                    break;
                case "info":
                    if (!args || (args && args.length < 1))
                        return Style_1.QuickEmbed("no arguments given");
                    Info(args);
                    break;
                case "play":
                    if (!args || (args && args.length < 1))
                        return Style_1.QuickEmbed("no arguments given");
                    Play(message, args);
                    break;
                case "remove":
                    if (!args || (args && args.length < 1))
                        return Style_1.QuickEmbed("no arguments given");
                    Remove(args);
                    break;
            }
        }
        message.channel.stopTyping(true);
    }
};
function Remove(args) {
    var songIndex = Number(args.shift());
    var favorites = dbFavorites_1.GetUserSongs(MessageHandler_1.GetMessage().author.id);
    songIndex--;
    if (!favorites || songIndex < 0 || songIndex > favorites.length)
        return Style_1.QuickEmbed("invalid song position");
    dbFavorites_1.RemoveSong(MessageHandler_1.GetMessage().author.id, songIndex);
}
function Play(message, args) {
    return __awaiter(this, void 0, void 0, function () {
        var songIndex, user, usersMentioned, userName_1, user_1, userResult, fav, song;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (args.length > 14)
                        return [2 /*return*/, Style_1.QuickEmbed("Too many arguments given")];
                    songIndex = undefined;
                    if (args.length === 1)
                        songIndex = Number(args.shift());
                    else
                        args.find(function (arg, pos) {
                            if (Number(arg)) {
                                songIndex = Number(arg);
                                args.splice(pos, 1);
                                return;
                            }
                        });
                    if (songIndex === undefined)
                        return [2 /*return*/, Style_1.QuickEmbed("no song index given")];
                    user = undefined;
                    usersMentioned = MessageHandler_1.GetMessage().mentions.members;
                    if (usersMentioned && usersMentioned.size > 0)
                        user = usersMentioned.first();
                    if (!!user) return [3 /*break*/, 2];
                    userName_1 = args.join();
                    return [4 /*yield*/, MessageHandler_1.GetMessage().channel.guild.members.find(function (usr) { return usr.displayName.toLowerCase() === userName_1.toLowerCase(); })];
                case 1:
                    user_1 = _a.sent();
                    if (!user_1) {
                        user_1 = MessageHandler_1.GetMessage().author;
                    }
                    userResult = dbUser_1.users.get(user_1.id);
                    if (!userResult)
                        return [2 /*return*/, Style_1.QuickEmbed("user not found")];
                    fav = userResult.favorites;
                    songIndex--;
                    if (fav.length < songIndex)
                        return [2 /*return*/, Style_1.QuickEmbed("song not found")];
                    song = fav[songIndex];
                    music_1.player.AddSong(song, MessageHandler_1.GetMessage());
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function Info(args) {
    return __awaiter(this, void 0, void 0, function () {
        var songIndex, user, usersMentioned, name_1, member, userResult, fav, song, embed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (args.length > 14)
                        return [2 /*return*/, Style_1.QuickEmbed("Too many arguments given")];
                    songIndex = undefined;
                    if (args.length === 1)
                        songIndex = Number(args.shift());
                    else
                        args.find(function (arg, pos) {
                            if (Number(arg)) {
                                songIndex = Number(arg);
                                args.splice(pos, 1);
                                return;
                            }
                        });
                    if (songIndex === undefined)
                        return [2 /*return*/, Style_1.QuickEmbed("no song index given")];
                    user = undefined;
                    usersMentioned = MessageHandler_1.GetMessage().mentions.members;
                    if (usersMentioned && usersMentioned.size > 0)
                        user = usersMentioned.first();
                    if (!!user) return [3 /*break*/, 2];
                    name_1 = args.join(" ");
                    return [4 /*yield*/, MessageHandler_1.GetMessage().guild.members.find(function (usr) { return usr.displayName.toLowerCase() === name_1.toLowerCase(); })];
                case 1:
                    member = _a.sent();
                    if (member)
                        user = member.user;
                    else
                        user = MessageHandler_1.GetMessage().author;
                    userResult = dbUser_1.users.get(user.id);
                    if (!userResult)
                        return [2 /*return*/, Style_1.QuickEmbed("user not found")];
                    fav = userResult.favorites;
                    songIndex--;
                    if (!fav)
                        return [2 /*return*/, Style_1.QuickEmbed("no favorites")];
                    if (fav.length < songIndex)
                        return [2 /*return*/, Style_1.QuickEmbed("song not found")];
                    song = fav[songIndex];
                    embed = new discord_js_1.RichEmbed()
                        .setTitle(song.title)
                        .setDescription(song.duration.duration + ("\n<" + song.url + ">"))
                        .setColor(Style_1.embedColor);
                    MessageHandler_1.GetMessage().channel.send(embed);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function AddSong(args) {
    return __awaiter(this, void 0, void 0, function () {
        var query, song, author, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = args.shift();
                    if (!query)
                        return [2 /*return*/];
                    return [4 /*yield*/, song_1.GetSong(query)];
                case 1:
                    song = _a.sent();
                    if (!song)
                        return [2 /*return*/, Style_1.QuickEmbed("song not found")];
                    author = MessageHandler_1.GetMessage().author;
                    user = {
                        nickname: author.username,
                        tag: author.tag,
                        id: author.id
                    };
                    dbUser_1.FindOrCreate(user);
                    dbFavorites_1.AddUserSong({ tag: user.tag, id: user.id, nickname: user.nickname }, song);
                    return [2 /*return*/];
            }
        });
    });
}
function ListFavorites(args) {
    return __awaiter(this, void 0, void 0, function () {
        var maxSongs, target, fav, pages, currentPage, songsInPage, embed, i, song, msgTemp, msg, filter, collector;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    maxSongs = 5;
                    return [4 /*yield*/, getTarget(args.join(" "))];
                case 1:
                    target = _a.sent();
                    fav = dbFavorites_1.GetUserSongs(target.id);
                    pages = new discord_js_1.Collection();
                    if (!fav || !fav.length) {
                        MessageHandler_1.GetMessage().channel.stopTyping(true);
                        return [2 /*return*/, Style_1.QuickEmbed("no favorites")];
                    }
                    currentPage = 0;
                    songsInPage = 0;
                    embed = new discord_js_1.RichEmbed();
                    for (i = 0; i < fav.length; i++) {
                        song = fav[i];
                        if (!pages.get(currentPage)) {
                            pages.set(currentPage, []);
                        }
                        pages.get(currentPage).push(song);
                        songsInPage++;
                        if (songsInPage >= maxSongs) {
                            songsInPage = 0;
                            currentPage++;
                        }
                    }
                    currentPage = 0;
                    if (pages.get(currentPage) === undefined || pages === undefined || currentPage === undefined)
                        return [2 /*return*/];
                    embed
                        .setThumbnail(target.avatarURL)
                        .addField("\n\n***Favorites***\nPage **" + (currentPage + 1) + "**\nTotal Songs **" + fav.length + "**", "\u200b")
                        .setColor(Style_1.embedColor);
                    pages
                        .get(currentPage)
                        .map(function (s, pos) { return embed.addField("**" + (pos + 1) + "\t" + s.title + "**", "Duration: " + s.duration.duration); });
                    return [4 /*yield*/, MessageHandler_1.GetMessage().channel.send(embed)];
                case 2:
                    msgTemp = _a.sent();
                    if (pages.size <= 1)
                        return [2 /*return*/, MessageHandler_1.GetMessage().channel.stopTyping(true)];
                    msg = undefined;
                    if (!Array.isArray(msgTemp))
                        msg = msgTemp;
                    if (!msg)
                        return [2 /*return*/, MessageHandler_1.GetMessage().channel.stopTyping(true)];
                    msg.react("⬅").then(function () { return msg.react("➡"); });
                    filter = function (reaction, user) {
                        return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
                    };
                    collector = msg.createReactionCollector(filter, { time: ms("15m") });
                    collector.on("collect", function (r) { return __awaiter(_this, void 0, void 0, function () {
                        var newEmbed;
                        return __generator(this, function (_a) {
                            if (r.emoji.name === "➡") {
                                currentPage++;
                                if (currentPage >= pages.size)
                                    currentPage = 0;
                            }
                            else if (r.emoji.name === "⬅") {
                                currentPage--;
                                if (currentPage < 0)
                                    currentPage = pages.size - 1;
                            }
                            r.remove(r.users.last());
                            newEmbed = new discord_js_1.RichEmbed()
                                .setThumbnail(target.avatarURL)
                                .addField("\n\n***Favorites***\nPage **" + (currentPage + 1) + "**\nTotal Songs **" + fav.length + "**", "\u200b")
                                .setColor(Style_1.embedColor);
                            pages
                                .get(currentPage)
                                .map(function (s, pos) {
                                return newEmbed.addField("**" + (pos + 1 + currentPage * maxSongs) + "\t" + s.title + "**", "Duration: " + s.duration.duration);
                            });
                            msg.edit(newEmbed);
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
function getTarget(userName) {
    var userName;
    return __awaiter(this, void 0, void 0, function () {
        var msg, user, member, member, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    msg = MessageHandler_1.GetMessage();
                    user = undefined;
                    userName = userName.toLowerCase();
                    if (!!userName) return [3 /*break*/, 2];
                    return [4 /*yield*/, msg.guild.fetchMember(msg.author)];
                case 1:
                    member = _a.sent();
                    user = member.user;
                    return [3 /*break*/, 5];
                case 2:
                    if (!(msg.mentions.users.size > 0)) return [3 /*break*/, 3];
                    user = msg.mentions.members.first().user;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, msg.guild.members.find(function (m) { return m.displayName.toLowerCase() === userName; })];
                case 4:
                    member = _a.sent();
                    if (member)
                        user = member.user;
                    _a.label = 5;
                case 5:
                    if (!!user) return [3 /*break*/, 7];
                    return [4 /*yield*/, msg.guild.fetchMember(msg.author)];
                case 6:
                    member = _a.sent();
                    user = member.user;
                    _a.label = 7;
                case 7:
                    dbUser_1.FindOrCreate({ tag: user.tag, id: user.id, nickname: user.username });
                    return [2 /*return*/, user];
            }
        });
    });
}
exports.getTarget = getTarget;
