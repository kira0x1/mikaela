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
var FavoritesUtil_1 = require("../../util/FavoritesUtil");
var userController_1 = require("../../db/userController");
var style_1 = require("../../util/style");
var discord_js_1 = require("discord.js");
var app_1 = require("../../app");
exports.command = {
    name: "shuffle",
    description: "Shuffle songs from a favorites list",
    usage: "[amount: optional] [target: optional]",
    aliases: ["random", "mix"],
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var amount, target, user, embed, player, title, firstSong, i, rand, song;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        amount = 1;
                        args.find(function (arg, pos) {
                            if (Number(arg)) {
                                amount = Number(arg);
                                args.splice(pos, 1);
                            }
                        });
                        return [4 /*yield*/, FavoritesUtil_1.getTarget(message, args.join(" "))];
                    case 1:
                        target = _a.sent();
                        return [4 /*yield*/, userController_1.getUser(target.id)];
                    case 2:
                        user = _a.sent();
                        if (!user.favorites) {
                            return [2 /*return*/, style_1.QuickEmbed(message, "You have no favorites to shuffle")];
                        }
                        embed = new discord_js_1.RichEmbed();
                        embed.setColor(style_1.embedColor);
                        player = app_1.getPlayer(message);
                        if (!player)
                            return [2 /*return*/, console.error("Could not find player for guild " + message.guild.name)];
                        if (amount > 15) {
                            embed.setFooter("Max Amount is 15!");
                            amount = 15;
                        }
                        title = "Shuffling " + amount + " song from " + user.username;
                        if (amount > 1) {
                            title = "Shuffling " + amount + " songs from " + user.username;
                        }
                        firstSong = user.favorites[Math.floor(Math.random() * user.favorites.length)];
                        return [4 /*yield*/, player.addSong(firstSong, message)];
                    case 3:
                        _a.sent();
                        embed.setTitle(title);
                        embed.setDescription("Playing " + firstSong.title + "\n" + firstSong.url + "\n\u200B");
                        embed.setAuthor(message.author.username, message.author.avatarURL);
                        embed.setThumbnail(target.avatarURL);
                        for (i = 0; i < amount - 1; i++) {
                            rand = Math.floor(Math.random() * user.favorites.length);
                            song = user.favorites[rand];
                            embed.addField(i + 1 + " " + song.title, song.url);
                            player.queue.addSong(song);
                        }
                        message.channel.send(embed);
                        return [2 /*return*/];
                }
            });
        });
    }
};
