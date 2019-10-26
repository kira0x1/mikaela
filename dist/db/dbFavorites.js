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
const mongoose_1 = require("mongoose");
const Style_1 = require("../util/Style");
const dbSetup_1 = require("./dbSetup");
const dbUser_1 = require("./dbUser");
exports.UserSongSchema = new mongoose_1.Schema({
    userId: { type: String, unique: false, required: true },
    song: {
        id: String,
        title: String,
        url: String,
        duration: {
            seconds: String,
            minutes: String,
            hours: String,
            duration: String
        }
    },
    created: {
        type: Date,
        default: Date.now()
    }
});
function GetUserSongs(userId) {
    const user = dbUser_1.users.get(userId);
    if (!user)
        return undefined;
    return user.favorites;
}
exports.GetUserSongs = GetUserSongs;
function FindSong(userId, songId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield dbUser_1.users.get(userId).favorites.find(song => song.id === songId);
    });
}
exports.FindSong = FindSong;
function AddUserSong(message, user, song) {
    return __awaiter(this, void 0, void 0, function* () {
        //Make sure user exists
        yield dbUser_1.FindOrCreate(user);
        let usersSongs = yield GetUserSongs(user.id);
        if (usersSongs.length > 0) {
            const songFound = yield usersSongs.find(s => s.id === song.id);
            if (songFound) {
                Style_1.QuickEmbed(message, `you already have this song as a favorite`);
                return;
            }
        }
        Style_1.QuickEmbed(message, `**${user.tag}** Added song ***${song.title}*** to their favorites`);
        var userSongsModel = yield dbSetup_1.conn.model("userSongs", exports.UserSongSchema);
        dbUser_1.users.get(user.id).AddSongToFavorites(song);
        userSongsModel.create({
            userId: user.id,
            song: {
                id: song.id,
                title: song.title,
                url: song.url,
                duration: song.duration
            }
        });
    });
}
exports.AddUserSong = AddUserSong;
function RemoveSong(message, userId, songIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        var userSongsModel = yield dbSetup_1.conn.model("userSongs", exports.UserSongSchema);
        const user = dbUser_1.users.get(userId);
        if (!user)
            return Style_1.QuickEmbed(message, `You have no favorites to remove`);
        const song = user.favorites[songIndex];
        if (!song)
            return Style_1.QuickEmbed(message, `Couldnt find a song at that position`);
        yield userSongsModel.deleteOne({ userId: userId, songId: song.id });
        dbUser_1.users.get(userId).favorites.splice(songIndex, 1);
    });
}
exports.RemoveSong = RemoveSong;
function initUserSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        var userSongsModel = yield dbSetup_1.conn.model("userSongs", exports.UserSongSchema);
        let usr = dbUser_1.users.array();
        for (let i = 0; i < usr.length; i++) {
            const usongs = yield userSongsModel.find({ userId: usr[i].id });
            yield usongs.map(doc => {
                let s = doc.toObject();
                usr[i].favorites.push(s.song);
            });
        }
    });
}
exports.initUserSongs = initUserSongs;
