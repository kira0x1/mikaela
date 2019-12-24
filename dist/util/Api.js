"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const config_1 = require("../config");
const dbSong_1 = require("../db/dbSong");
const ytdl_core_1 = require("ytdl-core");
function Get(url, options) {
    if (!options)
        options = {
            method: 'GET',
            json: true
        };
    return new Promise((resolve, reject) => {
        request_promise_1.default(url, options)
            .then(body => resolve(body))
            .catch(err => reject(err));
    });
}
exports.Get = Get;
function rand(max) {
    return Math.floor(Math.random() * max);
}
exports.rand = rand;
class Reddit {
    static Get(subreddit, sort, time, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?&t=${time}&limit=${limit}`;
            let posts = [];
            yield Get(url).then(data => {
                let body = JSON.parse(JSON.stringify(data));
                body.data.children.map(post => posts.push(post.data));
            });
            let nsfw = posts[0].over_18;
            return { posts, nsfw };
        });
    }
}
exports.Reddit = Reddit;
const options = {
    part: 'snippet',
    maxResults: 1,
    order: 'relevance',
    key: config_1.youTubeKey,
};
class Youtube {
    static Get(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://www.googleapis.com/youtube/v3/search?key=${options.key}&part=${options.part}&maxResults=${options.maxResults}&order=${options.order}&q=${query}`;
            let song = undefined;
            let id = undefined;
            yield request_promise_1.default(url).then(data => {
                let body = JSON.parse(data);
                id = body.items[0].id.videoId;
            }).catch(() => { });
            if (id) {
                let res = yield ytdl_core_1.getInfo(`https://www.youtube.com/watch?v=${id}`);
                song = { title: res.title, url: res.video_url, id: id, duration: dbSong_1.ConvertDuration(res.length_seconds) };
            }
            return song;
        });
    }
}
exports.Youtube = Youtube;
