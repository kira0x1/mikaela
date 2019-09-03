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
var request_promise_1 = __importDefault(require("request-promise"));
var config_1 = require("../config");
var dbSong_1 = require("../db/dbSong");
var ytdl_core_1 = require("ytdl-core");
function Get(url, options) {
    if (!options)
        options = {
            method: 'GET',
            json: true
        };
    return new Promise(function (resolve, reject) {
        request_promise_1.default(url, options)
            .then(function (body) { return resolve(body); })
            .catch(function (err) { return reject(err); });
    });
}
exports.Get = Get;
function rand(max) {
    return Math.floor(Math.random() * max);
}
exports.rand = rand;
var Reddit = /** @class */ (function () {
    function Reddit() {
    }
    Reddit.Get = function (subreddit, sort, time, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var url, posts, nsfw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://www.reddit.com/r/" + subreddit + "/" + sort + ".json?&t=" + time + "&limit=" + limit;
                        posts = [];
                        return [4 /*yield*/, Get(url).then(function (data) {
                                var body = JSON.parse(JSON.stringify(data));
                                body.data.children.map(function (post) { return posts.push(post.data); });
                            })];
                    case 1:
                        _a.sent();
                        nsfw = posts[0].over_18;
                        return [2 /*return*/, { posts: posts, nsfw: nsfw }];
                }
            });
        });
    };
    return Reddit;
}());
exports.Reddit = Reddit;
var options = {
    part: 'snippet',
    maxResults: 1,
    order: 'relevance',
    key: config_1.youTubeKey,
};
var Youtube = /** @class */ (function () {
    function Youtube() {
    }
    Youtube.Get = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var url, song, id, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "https://www.googleapis.com/youtube/v3/search?key=" + options.key + "&part=" + options.part + "&maxResults=" + options.maxResults + "&order=" + options.order + "&q=" + query;
                        song = undefined;
                        id = undefined;
                        return [4 /*yield*/, request_promise_1.default(url).then(function (data) {
                                var body = JSON.parse(data);
                                id = body.items[0].id.videoId;
                            }).catch(function () { })];
                    case 1:
                        _a.sent();
                        if (!id) return [3 /*break*/, 3];
                        return [4 /*yield*/, ytdl_core_1.getInfo("https://www.youtube.com/watch?v=" + id)];
                    case 2:
                        res = _a.sent();
                        song = { title: res.title, url: res.video_url, id: id, duration: dbSong_1.ConvertDuration(res.length_seconds) };
                        _a.label = 3;
                    case 3: return [2 /*return*/, song];
                }
            });
        });
    };
    return Youtube;
}());
exports.Youtube = Youtube;
