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
const mongoose_1 = require("mongoose");
const dbSetup_1 = require("./dbSetup");
const dbSong_1 = require("./dbSong");
exports.users = new discord_js_1.Collection();
//Setup users schema
exports.UserSchema = new mongoose_1.Schema({
    tag: { type: String, required: true, unique: true },
    id: { type: String, required: true, unique: true },
    nickname: { type: String, required: false, unique: false },
    created: { type: Date, default: Date.now() }
});
//Create or Get the users model (table)
const UserModel = mongoose_1.model("users", exports.UserSchema);
function initUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        var userModel = yield dbSetup_1.conn.model("users", exports.UserSchema);
        const usersFound = yield userModel.find();
        usersFound.map((doc) => __awaiter(this, void 0, void 0, function* () {
            const userJson = doc.toObject();
            const user = new User(userJson.tag, userJson.nickname, userJson.id, []);
            exports.users.set(user.id, user);
        }));
    });
}
exports.initUsers = initUsers;
function FindOrCreate(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let userFound = exports.users.get(user.id);
        if (!userFound)
            yield CreateUser(user.tag, user.id, user.nickname);
        return exports.users.get(user.id);
    });
}
exports.FindOrCreate = FindOrCreate;
//Find a user by their tag
function FindUser(tag) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                yield UserModel.collection.findOne({ tag: tag }, function (err, usr) {
                    if (err || !usr) {
                        return reject(undefined);
                    }
                    return resolve(usr);
                });
            });
        });
    });
}
exports.FindUser = FindUser;
//Create a UserModel and insert it into the database, returns an error if the user already exists
function CreateUser(tag, id, nickname) {
    return __awaiter(this, void 0, void 0, function* () {
        var usersModel = yield dbSetup_1.conn.model("users", exports.UserSchema);
        console.log(`creating user: ${tag}`);
        usersModel.create({ tag: tag, id: id, nickname: nickname });
        exports.users.set(id, new User(tag, nickname, id, []));
    });
}
exports.CreateUser = CreateUser;
class User {
    constructor(tag, nickname, id, favorites) {
        this.tag = tag;
        this.nickname = nickname;
        this.id = id;
        this.favorites = favorites;
    }
    AddSongToFavorites(song) {
        this.favorites.push(song);
        dbSong_1.CreateSong(song.title, song.id, song.url, song.duration);
    }
}
exports.User = User;
function debugUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        exports.users.map(usr => {
            console.log(`user favorites`);
            usr.favorites.map(fav => {
                console.dir(fav);
            });
        });
    });
}
exports.debugUsers = debugUsers;
