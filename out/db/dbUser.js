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
var fs_1 = require("fs");
var mongoose_1 = require("mongoose");
var path_1 = __importDefault(require("path"));
var database_1 = require("./database");
exports.users = new discord_js_1.Collection();
exports.UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    id: { type: String, required: true },
    tag: { type: String, required: true },
    roles: { type: [{ name: String, id: String }], required: true },
    favorites: { type: Array(), required: false },
    createdAt: Date
});
exports.userModel = mongoose_1.model("users", exports.UserSchema);
//Create a UserModel and insert it into the database, returns an error if the user already exists
function CreateUser(user) {
    var usersModel = database_1.conn.model("users", exports.UserSchema);
    if (user instanceof discord_js_1.GuildMember) {
        var memberUser = {
            username: user.user.username,
            tag: user.user.tag,
            id: user.id,
            favorites: [],
            roles: []
        };
        console.log("creating user: " + memberUser.username);
        return exports.userModel.create(memberUser);
    }
    else {
        console.log("creating user: " + user.username);
        return usersModel.create(user);
    }
}
exports.CreateUser = CreateUser;
var usersJson = require('../../usersongs.json');
function InitUsers(client) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            usersJson.users.map(function (user) {
                CreateUser(user);
            });
            return [2 /*return*/];
        });
    });
}
exports.InitUsers = InitUsers;
function writeUsersToJSON(client) {
    return __awaiter(this, void 0, void 0, function () {
        var collections, usersongs, users, usersFound, userIds, songsJson, i, userFound, user;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, database_1.conn.db.collections()];
                case 1:
                    collections = _a.sent();
                    usersongs = collections.find(function (col) { return col.collectionName === "usersongs"; });
                    users = collections.find(function (col) { return col.collectionName === "users"; });
                    if (!users || !usersongs)
                        return [2 /*return*/];
                    usersFound = [];
                    userIds = [];
                    return [4 /*yield*/, users.find().forEach(function (userData) {
                            userIds.push(userData.id);
                        })];
                case 2:
                    _a.sent();
                    userIds.map(function (id) { return __awaiter(_this, void 0, void 0, function () {
                        var user, iuser;
                        return __generator(this, function (_a) {
                            user = client.users.find(function (usr) { return usr.id === id; });
                            if (user) {
                                iuser = {
                                    username: user.username,
                                    id: user.id,
                                    tag: user.tag,
                                    roles: [],
                                    favorites: []
                                };
                                usersFound.push(iuser);
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    songsJson = "{\"users\": [";
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < usersFound.length)) return [3 /*break*/, 6];
                    userFound = usersFound[i];
                    user = mapUser(userFound.id, client);
                    if (!user) return [3 /*break*/, 5];
                    songsJson += "{\"username\": \"" + userFound.username + "\",";
                    songsJson += "\"id\": \"" + userFound.id + "\",";
                    songsJson += "\"tag\": \"" + userFound.tag + "\",";
                    songsJson += "\"roles\": [],";
                    songsJson += "\"favorites\":[";
                    return [4 /*yield*/, usersongs.find({ userId: userFound.id }).toArray().then(function (songs) {
                            songs.map(function (data, index) {
                                var song = data.song;
                                var isong = {
                                    title: song.title,
                                    id: song.id,
                                    url: song.url,
                                    duration: song.duration
                                };
                                songsJson += JSON.stringify(isong);
                                if (index < songs.length - 1)
                                    songsJson += ",";
                            });
                        })];
                case 4:
                    _a.sent();
                    songsJson += "]}";
                    if (i < usersFound.length - 1)
                        songsJson += ",";
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    songsJson += "]}";
                    fs_1.writeFileSync(path_1.default.join(__dirname, "..", "..", "usersongs.json"), songsJson);
                    return [2 /*return*/];
            }
        });
    });
}
function mapUser(id, client) {
    return client.users.find(function (user) { return user.id === id; });
}
