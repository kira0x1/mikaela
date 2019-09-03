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
var Api_1 = require("../util/Api");
var CommandUtil_1 = require("../util/CommandUtil");
var Emoji_1 = require("../util/Emoji");
var MessageHandler_1 = require("../util/MessageHandler");
var Style_1 = require("../util/Style");
var Flags = [
    {
        name: "sort",
        aliases: ["s"],
        description: "sort posts by time"
    },
    {
        name: "time",
        aliases: ["t"],
        description: "week, month, year, all"
    },
    {
        name: "amount",
        aliases: ["n"],
        description: "Amount of posts"
    }
];
var command = {
    name: "reddit",
    description: "Posts reddit links",
    aliases: ["r", "rd"],
    usage: "[subreddit] optional: -sort -time -rank",
    args: true,
    flags: Flags,
    execute: function (message, args) {
        return __awaiter(this, void 0, void 0, function () {
            var flagsFound, subreddit, limit, time, sort, posts, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        flagsFound = CommandUtil_1.CommandUtil.GetArgs(args, Flags, true);
                        subreddit = args.join();
                        limit = Number(flagsFound.get("amount")) || 1;
                        time = flagsFound.get("time") || "all";
                        sort = flagsFound.get("sort") || "top";
                        if (!subreddit)
                            return [2 /*return*/, Style_1.QuickEmbed("no subreddit given")];
                        if (limit > 10)
                            limit = 10;
                        message.channel.startTyping();
                        return [4 /*yield*/, Api_1.Reddit.Get(subreddit, sort, time, limit)];
                    case 1:
                        posts = _a.sent();
                        message.channel.stopTyping(true);
                        msg = [];
                        if (posts === undefined)
                            return [2 /*return*/, Style_1.QuickEmbed("subreddit not found")];
                        msg.push("**Subreddit** *https://www.reddit.com/r/" + posts.posts[0].subreddit + "*\n");
                        if (message.channel.nsfw === false && posts.nsfw)
                            return [2 /*return*/, Style_1.QuickEmbed("This is not a **NSFW** channel.  " + Emoji_1.sweat)];
                        posts.posts.map(function (p) {
                            msg.push("**" + p.title + "** *(" + p.ups + " upvotes)*  " + p.url);
                        });
                        MessageHandler_1.Send(msg.join("\n"));
                        return [2 /*return*/];
                }
            });
        });
    }
};
module.exports = { command: command };
