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
var mongoose_1 = require("mongoose");
var dbSetup_1 = require("./dbSetup");
var dbSong_1 = require("./dbSong");
exports.users = new discord_js_1.Collection();
//Setup users schema
exports.UserSchema = new mongoose_1.Schema({
    tag: { type: String, required: true, unique: true },
    id: { type: String, required: true, unique: true },
    nickname: { type: String, required: false, unique: false },
    created: { type: Date, default: Date.now() }
});
//Create or Get the users model (table)
var UserModel = mongoose_1.model("users", exports.UserSchema);
function initUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var userModel, usersFound;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("users", exports.UserSchema)];
                case 1:
                    userModel = _a.sent();
                    return [4 /*yield*/, userModel.find()];
                case 2:
                    usersFound = _a.sent();
                    usersFound.map(function (doc) { return __awaiter(_this, void 0, void 0, function () {
                        var userJson, user;
                        return __generator(this, function (_a) {
                            userJson = doc.toObject();
                            user = new User(userJson.tag, userJson.nickname, userJson.id, []);
                            exports.users.set(user.id, user);
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
exports.initUsers = initUsers;
function FindOrCreate(user) {
    return __awaiter(this, void 0, void 0, function () {
        var userFound;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userFound = exports.users.get(user.id);
                    if (!!userFound) return [3 /*break*/, 2];
                    return [4 /*yield*/, CreateUser(user.tag, user.id, user.nickname)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, exports.users.get(user.id)];
            }
        });
    });
}
exports.FindOrCreate = FindOrCreate;
//Find a user by their tag
function FindUser(tag) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, UserModel.collection.findOne({ tag: tag }, function (err, usr) {
                                        if (err || !usr) {
                                            return reject(undefined);
                                        }
                                        return resolve(usr);
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                })];
        });
    });
}
exports.FindUser = FindUser;
//Create a UserModel and insert it into the database, returns an error if the user already exists
function CreateUser(tag, id, nickname) {
    return __awaiter(this, void 0, void 0, function () {
        var usersModel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, dbSetup_1.conn.model("users", exports.UserSchema)];
                case 1:
                    usersModel = _a.sent();
                    console.log("creating user: " + tag);
                    usersModel.create({ tag: tag, id: id, nickname: nickname });
                    exports.users.set(id, new User(tag, nickname, id, []));
                    return [2 /*return*/];
            }
        });
    });
}
exports.CreateUser = CreateUser;
var User = /** @class */ (function () {
    function User(tag, nickname, id, favorites) {
        this.tag = tag;
        this.nickname = nickname;
        this.id = id;
        this.favorites = favorites;
    }
    User.prototype.AddSongToFavorites = function (song) {
        this.favorites.push(song);
        dbSong_1.CreateSong(song.title, song.id, song.url, song.duration);
    };
    return User;
}());
exports.User = User;
function debugUsers() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            exports.users.map(function (usr) {
                console.log("user favorites");
                usr.favorites.map(function (fav) {
                    console.dir(fav);
                });
            });
            return [2 /*return*/];
        });
    });
}
exports.debugUsers = debugUsers;
