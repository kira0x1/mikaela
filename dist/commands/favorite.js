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
const dbFavorites_1 = require("../db/dbFavorites");
const dbUser_1 = require("../db/dbUser");
const song_1 = require("../objects/song");
const Style_1 = require("../util/Style");
const music_1 = require("./music");
const ms = require("ms");
const flags = [
    { name: "list", aliases: ["ls", "l"] },
    { name: "add", aliases: ["a"] },
    { name: "play", aliases: ["p"] },
    { name: "info", aliases: ["i"] },
    { name: "remove", aliases: ["r"] },
    { name: "shuffle", aliases: ["sf", "random", "r", "rand", "mix"] }
];
exports.command = {
    name: "favorite",
    description: "Favorite songs",
    aliases: ["fav", "f"],
    flags: flags,
    cooldown: 3,
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            message.channel.startTyping();
            let msg = args.shift() || "";
            if (msg === "")
                return;
            let flag = flags.find(f => f.name === msg || (f.aliases && f.aliases.includes(msg)));
            if (flag) {
                switch (flag.name) {
                    case "list":
                        ListFavorites(message, args);
                        break;
                    case "add":
                        if (!args || (args && args.length === 0))
                            return Style_1.QuickEmbed(message, `no songs given`);
                        AddSong(message, args);
                        break;
                    case "info":
                        if (!args || (args && args.length < 1))
                            return Style_1.QuickEmbed(message, `no arguments given`);
                        Info(message, args);
                        break;
                    case "play":
                        if (!args || (args && args.length < 1))
                            return Style_1.QuickEmbed(message, `no arguments given`);
                        Play(message, args);
                        break;
                    case "remove":
                        if (!args || (args && args.length < 1))
                            return Style_1.QuickEmbed(message, `no arguments given`);
                        Remove(message, args);
                        break;
                    case "shuffle":
                        Shuffle(message, args);
                        break;
                }
            }
            message.channel.stopTyping(true);
        });
    }
};
function Remove(message, args) {
    let songIndex = Number(args.shift());
    const favorites = dbFavorites_1.GetUserSongs(message.author.id);
    songIndex--;
    if (!favorites || songIndex < 0 || songIndex > favorites.length)
        return Style_1.QuickEmbed(message, `invalid song position`);
    dbFavorites_1.RemoveSong(message, message.author.id, songIndex);
}
function Play(message, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.length > 14)
            return Style_1.QuickEmbed(message, `Too many arguments given`);
        let songIndex = undefined;
        if (args.length === 1)
            songIndex = Number(args.shift());
        else
            args.find((arg, pos) => {
                if (Number(arg)) {
                    songIndex = Number(arg);
                    args.splice(pos, 1);
                    return;
                }
            });
        if (songIndex === undefined)
            return Style_1.QuickEmbed(message, `no song index given`);
        let user = undefined;
        const usersMentioned = message.mentions.members;
        if (usersMentioned && usersMentioned.size > 0)
            user = usersMentioned.first();
        if (!user) {
            let userName = args.join();
            // / message.guild.members.find(usr => usr.displayName.toLowerCase() === displayName.toLowerCase())
            let user = yield message.channel.guild.members.find(usr => usr.displayName.toLowerCase() === userName.toLowerCase());
            if (!user) {
                user = message.author;
            }
            const userResult = dbUser_1.users.get(user.id);
            if (!userResult)
                return Style_1.QuickEmbed(message, `user not found`);
            const fav = userResult.favorites;
            songIndex--;
            if (fav.length < songIndex)
                return Style_1.QuickEmbed(message, `song not found`);
            const song = fav[songIndex];
            music_1.player.AddSong(song, message);
        }
    });
}
function Info(message, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.length > 14)
            return Style_1.QuickEmbed(message, `Too many arguments given`);
        let songIndex = undefined;
        if (args.length === 1)
            songIndex = Number(args.shift());
        else
            args.find((arg, pos) => {
                if (Number(arg)) {
                    songIndex = Number(arg);
                    args.splice(pos, 1);
                    return;
                }
            });
        if (songIndex === undefined)
            return Style_1.QuickEmbed(message, `no song index given`);
        let user = undefined;
        const usersMentioned = message.mentions.members;
        if (usersMentioned && usersMentioned.size > 0)
            user = usersMentioned.first();
        if (!user) {
            let name = args.join(" ");
            const member = yield message.guild.members.find(usr => usr.displayName.toLowerCase() === name.toLowerCase());
            if (member)
                user = member.user;
            else
                user = message.author;
            const userResult = dbUser_1.users.get(user.id);
            if (!userResult)
                return Style_1.QuickEmbed(message, `user not found`);
            const fav = userResult.favorites;
            songIndex--;
            if (!fav)
                return Style_1.QuickEmbed(message, `no favorites`);
            if (fav.length < songIndex)
                return Style_1.QuickEmbed(message, `song not found`);
            const song = fav[songIndex];
            let embed = new discord_js_1.RichEmbed()
                .setTitle(song.title)
                .setDescription(song.duration.duration + `\n<${song.url}>`)
                .setColor(Style_1.embedColor);
            message.channel.send(embed);
        }
    });
}
function AddSong(message, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = args.shift();
        if (!query)
            return;
        const song = yield song_1.GetSong(query);
        if (!song)
            return Style_1.QuickEmbed(message, "song not found");
        const author = message.author;
        const user = {
            nickname: author.username,
            tag: author.tag,
            id: author.id
        };
        dbUser_1.FindOrCreate(user);
        dbFavorites_1.AddUserSong(message, { tag: user.tag, id: user.id, nickname: user.nickname }, song);
    });
}
function Shuffle(message, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.length > 14)
            return Style_1.QuickEmbed(message, `Too many arguments given`);
        let shuffleAmount = undefined;
        if (args.length === 1) {
            if (Number(args[0]))
                shuffleAmount = Number(args.shift());
        }
        else {
            args.find((arg, pos) => {
                if (Number(arg)) {
                    shuffleAmount = Number(arg);
                    args.splice(pos, 1);
                    return;
                }
            });
        }
        const target = yield getTarget(message, args.join(" "));
        if (!target)
            return Style_1.QuickEmbed(message, "User not found");
        const fav = dbFavorites_1.GetUserSongs(target.id);
        if (!fav || !fav.length) {
            message.channel.stopTyping(true);
            return Style_1.QuickEmbed(message, `no favorites`);
        }
        const embed = new discord_js_1.RichEmbed()
            .setTitle(`Shuffling from user ${target.username}`)
            .setThumbnail(target.avatarURL)
            .setDescription(`Shuffling ${shuffleAmount || 1} songs`)
            .setColor(Style_1.embedColor);
        message.channel.send(embed);
        //Play one song manually before entering loop
        let firstSong = PickSong(fav.length);
        music_1.player.AddSong(fav[firstSong], message);
        let songsPicked = [];
        let i = 0;
        while (i < shuffleAmount) {
            let songPos = PickSong(fav.length);
            if (songsPicked.includes(songPos)) {
                songPos = PickSong(fav.length);
            }
            else {
                songsPicked.push(songPos);
                yield music_1.player.AddSong(fav[songPos], message);
                i++;
            }
        }
    });
}
function PickSong(shuffleAmount) {
    return Math.floor(Math.random() * shuffleAmount);
}
function ListFavorites(message, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxSongs = 5;
        const target = yield getTarget(message, args.join(" "));
        const fav = dbFavorites_1.GetUserSongs(target.id);
        const pages = new discord_js_1.Collection();
        if (!fav || !fav.length) {
            message.channel.stopTyping(true);
            return Style_1.QuickEmbed(message, `no favorites`);
        }
        let currentPage = 0;
        let songsInPage = 0;
        let embed = new discord_js_1.RichEmbed();
        for (let i = 0; i < fav.length; i++) {
            const song = fav[i];
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
            return;
        embed
            .setThumbnail(target.avatarURL)
            .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${fav.length}**`, "\u200b")
            .setColor(Style_1.embedColor);
        pages
            .get(currentPage)
            .map((s, pos) => embed.addField(`**${pos + 1}\t${s.title}**`, "Duration: " + s.duration.duration));
        const msgTemp = yield message.channel.send(embed);
        if (pages.size <= 1)
            return message.channel.stopTyping(true);
        let msg = undefined;
        if (!Array.isArray(msgTemp))
            msg = msgTemp;
        if (!msg)
            return message.channel.stopTyping(true);
        msg.react("⬅").then(() => msg.react("➡"));
        const filter = (reaction, user) => {
            return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
        };
        const collector = msg.createReactionCollector(filter, { time: ms("2h") });
        collector.on("collect", (r) => __awaiter(this, void 0, void 0, function* () {
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
            const newEmbed = new discord_js_1.RichEmbed()
                .setThumbnail(target.avatarURL)
                .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${fav.length}**`, "\u200b")
                .setColor(Style_1.embedColor);
            pages
                .get(currentPage)
                .map((s, pos) => newEmbed.addField(`**${pos + 1 + currentPage * maxSongs}\t${s.title}**`, "Duration: " + s.duration.duration));
            msg.edit(newEmbed);
        }));
    });
}
function getTarget(message, userName) {
    var userName;
    return __awaiter(this, void 0, void 0, function* () {
        let user = undefined;
        userName = userName.toLowerCase();
        if (!userName) {
            let member = yield message.guild.fetchMember(message.author);
            user = member.user;
        }
        else {
            if (message.mentions.users.size > 0)
                user = message.mentions.members.first().user;
            else {
                let member = yield message.guild.members.find(m => m.displayName.toLowerCase() === userName);
                if (member)
                    user = member.user;
            }
        }
        if (!user) {
            let member = yield message.guild.fetchMember(message.author);
            user = member.user;
        }
        dbUser_1.FindOrCreate({ tag: user.tag, id: user.id, nickname: user.username });
        return user;
    });
}
exports.getTarget = getTarget;
