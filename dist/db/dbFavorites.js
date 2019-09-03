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
var Style_1 = require("../util/Style");
var dbSetup_1 = require("./dbSetup");
var dbUser_1 = require("./dbUser");
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
    var user = dbUser_1.users.get(userId);
    if (!user)
        return undefined;
    return user.favorites;
}
exports.GetUserSongs = GetUserSongs;
function FindSong(userId, songId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbUser_1.users.get(userId).favorites.find(function (song) { return song.id === songId; })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.FindSong = FindSong;
function AddUserSong(user, song) {
    return __awaiter(this, void 0, void 0, function () {
        var usersSongs, songFound, userSongsModel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //Make sure user exists
                return [4 /*yield*/, dbUser_1.FindOrCreate(user)];
                case 1:
                    //Make sure user exists
                    _a.sent();
                    return [4 /*yield*/, GetUserSongs(user.id)];
                case 2:
                    usersSongs = _a.sent();
                    if (!(usersSongs.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, usersSongs.find(function (s) { return s.id === song.id; })];
                case 3:
                    songFound = _a.sent();
                    if (songFound) {
                        Style_1.QuickEmbed("you already have this song as a favorite");
                        return [2 /*return*/];
                    }
                    _a.label = 4;
                case 4:
                    Style_1.QuickEmbed("**" + user.tag + "** Added song ***" + song.title + "*** to their favorites");
                    return [4 /*yield*/, dbSetup_1.conn.model("userSongs", exports.UserSongSchema)];
                case 5:
                    userSongsModel = _a.sent();
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
                    return [2 /*return*/];
            }
        });
    });
}
exports.AddUserSong = AddUserSong;
function RemoveSong(userId, songIndex) {
    return __awaiter(this, void 0, void 0, function () {
        var userSongsModel, user, song;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("userSongs", exports.UserSongSchema)];
                case 1:
                    userSongsModel = _a.sent();
                    user = dbUser_1.users.get(userId);
                    if (!user)
                        return [2 /*return*/, Style_1.QuickEmbed("You have no favorites to remove")];
                    song = user.favorites[songIndex];
                    if (!song)
                        return [2 /*return*/, Style_1.QuickEmbed("Couldnt find a song at that position")];
                    return [4 /*yield*/, userSongsModel.deleteOne({ userId: userId, songId: song.id })];
                case 2:
                    _a.sent();
                    dbUser_1.users.get(userId).favorites.splice(songIndex, 1);
                    return [2 /*return*/];
            }
        });
    });
}
exports.RemoveSong = RemoveSong;
function initUserSongs() {
    return __awaiter(this, void 0, void 0, function () {
        var userSongsModel, usr, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("userSongs", exports.UserSongSchema)];
                case 1:
                    userSongsModel = _a.sent();
                    usr = dbUser_1.users.array();
                    _loop_1 = function (i) {
                        var usongs;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, userSongsModel.find({ userId: usr[i].id })];
                                case 1:
                                    usongs = _a.sent();
                                    return [4 /*yield*/, usongs.map(function (doc) {
                                            var s = doc.toObject();
                                            usr[i].favorites.push(s.song);
                                        })];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < usr.length)) return [3 /*break*/, 5];
                    return [5 /*yield**/, _loop_1(i)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.initUserSongs = initUserSongs;
