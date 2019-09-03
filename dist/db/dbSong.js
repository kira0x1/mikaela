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
var mongoose_1 = require("mongoose");
var dbSetup_1 = require("./dbSetup");
var discord_js_1 = require("discord.js");
var songs = new discord_js_1.Collection();
function ConvertDuration(duration_seconds) {
    var minutes = Math.floor(Number(duration_seconds) / 60);
    var seconds = Math.floor(Number(duration_seconds) - minutes * 60);
    var hours = Math.floor(minutes / 60);
    if (seconds < 10)
        seconds = "0" + seconds;
    var duration = {
        seconds: seconds.toString(),
        minutes: minutes.toString(),
        hours: hours.toString(),
        duration: minutes + ":" + seconds
    };
    return duration;
}
exports.ConvertDuration = ConvertDuration;
var SongSchema = new mongoose_1.Schema({
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
    return __awaiter(this, void 0, void 0, function () {
        var songsModel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("songs", SongSchema)];
                case 1:
                    songsModel = _a.sent();
                    return [4 /*yield*/, songsModel.findOne({ id: id })];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.FindSong = FindSong;
function initSongs() {
    return __awaiter(this, void 0, void 0, function () {
        var songsModel, songsDb;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("songs", SongSchema)];
                case 1:
                    songsModel = _a.sent();
                    return [4 /*yield*/, songsModel.find()];
                case 2:
                    songsDb = _a.sent();
                    songsDb.map(function (s) { return songs.set(s.id, s); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.initSongs = initSongs;
function CreateSong(title, id, url, duration) {
    return __awaiter(this, void 0, void 0, function () {
        var songsModel, songFound;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("songs", SongSchema)];
                case 1:
                    songsModel = _a.sent();
                    return [4 /*yield*/, FindSong(id)];
                case 2:
                    songFound = _a.sent();
                    if (!(!songFound || songFound === null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, songsModel.create({
                            id: id,
                            title: title,
                            url: url,
                            duration: duration
                        })];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.CreateSong = CreateSong;
