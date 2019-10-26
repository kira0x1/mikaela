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
const dbSetup_1 = require("./dbSetup");
const discord_js_1 = require("discord.js");
const songs = new discord_js_1.Collection();
function ConvertDuration(duration_seconds) {
    let minutes = Math.floor(Number(duration_seconds) / 60);
    let seconds = Math.floor(Number(duration_seconds) - minutes * 60);
    let hours = Math.floor(minutes / 60);
    if (seconds < 10)
        seconds = "0" + seconds;
    const duration = {
        seconds: seconds.toString(),
        minutes: minutes.toString(),
        hours: hours.toString(),
        duration: `${minutes}:${seconds}`
    };
    return duration;
}
exports.ConvertDuration = ConvertDuration;
const SongSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, unique: false },
    url: { type: String, required: true, unique: false },
    duration: {
        seconds: String,
        minutes: String,
        hours: String,
        duration: String
    },
    created: {
        type: Date,
        default: Date.now()
    }
});
function FindSong(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var songsModel = yield dbSetup_1.conn.model("songs", SongSchema);
        return yield songsModel.findOne({ id: id });
    });
}
exports.FindSong = FindSong;
function initSongs() {
    return __awaiter(this, void 0, void 0, function* () {
        var songsModel = yield dbSetup_1.conn.model("songs", SongSchema);
        const songsDb = yield songsModel.find();
        songsDb.map(s => songs.set(s.id, s));
    });
}
exports.initSongs = initSongs;
function CreateSong(title, id, url, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        var songsModel = yield dbSetup_1.conn.model("songs", SongSchema);
        const songFound = yield FindSong(id);
        if (!songFound || songFound === null)
            return yield songsModel.create({
                id: id,
                title: title,
                url: url,
                duration: duration
            });
    });
}
exports.CreateSong = CreateSong;
