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
var chalk_1 = __importDefault(require("chalk"));
var discord_js_1 = require("discord.js");
var userController_1 = require("../../db/userController");
var FavoritesUtil_1 = require("../../util/FavoritesUtil");
var style_1 = require("../../util/style");
exports.command = {
    name: "list",
    description: "Lists your favorites or someone elses",
    usage: "[empty | user]",
    isSubCommand: true,
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, FavoritesUtil_1.getTarget(message, args.join(" "))];
                    case 1:
                        target = _a.sent();
                        if (target) {
                            userController_1.getUser(target.id).then(function (user) {
                                console.log("Found user: " + user.tag);
                                if (user.favorites) {
                                    ListFavorites(message, target, user);
                                }
                                else {
                                    style_1.QuickEmbed(message, "You dont have any favorites");
                                }
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
};
function ListFavorites(message, target, user) {
    return __awaiter(this, void 0, void 0, function () {
        var songs, songsPerPage, pages, count, pageAtInLoop, i, pageSongs, pageAt, embed, title, page, msg, filter, collector, currentPage;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    songs = user.favorites;
                    songsPerPage = 5;
                    pages = new discord_js_1.Collection();
                    count = 0;
                    pageAtInLoop = 0;
                    pages.set(0, []);
                    for (i = 0; i < songs.length; i++) {
                        if (count >= songsPerPage) {
                            count = 0;
                            pageAtInLoop++;
                            pages.set(pageAtInLoop, []);
                        }
                        pageSongs = pages.get(pageAtInLoop);
                        if (pageSongs) {
                            pageSongs.push(songs[i]);
                        }
                        else {
                            console.log(chalk_1.default.bgRed.bold("Page Songs undefined"));
                        }
                        count++;
                    }
                    pageAt = 0;
                    embed = new discord_js_1.RichEmbed();
                    embed.setColor(style_1.embedColor);
                    embed.setThumbnail(target.avatarURL);
                    title = "**Favorites**\nPage **" + (pageAt + 1) + "**";
                    title += "\nSongs **" + user.favorites.length + "**";
                    title += "\n\u200b";
                    embed.setTitle(title);
                    page = pages.get(pageAt);
                    if (page) {
                        page.map(function (song, index) {
                            var num = "**" + (index + 1) + "**  ";
                            var content = "Duration: " + song.duration.duration;
                            content += "  " + song.url;
                            var title = num + " " + ("**" + song.title + "**");
                            embed.addField(title, content);
                        });
                    }
                    return [4 /*yield*/, message.channel.send(embed)];
                case 1:
                    msg = _a.sent();
                    if (!(msg instanceof discord_js_1.Message)) {
                        return [2 /*return*/];
                    }
                    msg.react("⬅").then(function () { return msg.react("➡"); });
                    filter = function (reaction, user) {
                        return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
                    };
                    collector = msg.createReactionCollector(filter);
                    currentPage = 0;
                    collector.on("collect", function (r) { return __awaiter(_this, void 0, void 0, function () {
                        var title, newEmbed, page;
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
                            title = "**Favorites**\nPage **" + (currentPage + 1) + "**";
                            title += "\nSongs **" + user.favorites.length + "**";
                            title += "\n\u200b";
                            newEmbed = new discord_js_1.RichEmbed()
                                .setThumbnail(target.avatarURL)
                                .setTitle(title)
                                .setColor(style_1.embedColor);
                            page = pages.get(currentPage);
                            if (!page)
                                return [2 /*return*/];
                            page.map(function (song, index) {
                                var num = "**" + (index + 1) + "**  ";
                                var content = "Duration: " + song.duration.duration;
                                content += "  " + song.url;
                                var title = num + " " + ("**" + song.title + "**");
                                newEmbed.addField(title, content);
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
