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
const config_1 = require("../config");
const dbFavorites_1 = require("./dbFavorites");
const dbSong_1 = require("./dbSong");
const dbUser_1 = require("./dbUser");
exports.conn = undefined;
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        exports.conn = yield mongoose_1.createConnection(config_1.dbLogin, {
            useNewUrlParser: true,
            useCreateIndex: true,
            keepAlive: true
        });
        yield console.log(`connected to mongodb`);
        yield dbUser_1.initUsers();
        yield dbFavorites_1.initUserSongs();
        yield dbSong_1.initSongs();
    });
}
exports.dbinit = init;
