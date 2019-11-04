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
const ms = require("ms");
const reactionDuration = ms(`2h`);
//Emojis in collection
let emojis = new discord_js_1.Collection();
exports.sweat = "😰";
function init(client) {
    client.emojis.map(emoji => emojis.set(emoji.name, emoji));
}
exports.init = init;
function getEmoji(name) {
    return emojis.get(name);
}
exports.getEmoji = getEmoji;
function FavoritesHandler(message, emojiName, song) {
    return __awaiter(this, void 0, void 0, function* () {
        const emoji = getEmoji(emojiName);
        if (!emoji)
            return console.error(`Emoji not found`);
        const filter = (reaction, user) => {
            return reaction.emoji.name === emoji.name && !user.bot;
        };
        message.react(emoji);
        const collector = message.createReactionCollector(filter, { time: reactionDuration });
        collector.on("collect", (reaction, reactionCollector) => __awaiter(this, void 0, void 0, function* () {
            const user = reaction.users.last();
            dbFavorites_1.AddUserSong(message, { tag: user.tag, id: user.id, nickname: user.username }, song);
        }));
        collector.on("end", collected => {
            message.clearReactions();
        });
    });
}
exports.FavoritesHandler = FavoritesHandler;
