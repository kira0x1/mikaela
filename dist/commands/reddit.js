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
const Api_1 = require("../util/Api");
const CommandUtil_1 = require("../util/CommandUtil");
const Emoji_1 = require("../util/Emoji");
const MessageHandler_1 = require("../util/MessageHandler");
const Style_1 = require("../util/Style");
const Flags = [
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
const command = {
    name: "reddit",
    description: "Posts reddit links",
    aliases: ["r", "rd"],
    usage: "[subreddit] optional: -sort -time -rank",
    args: true,
    flags: Flags,
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const flagsFound = CommandUtil_1.CommandUtil.GetArgs(args, Flags, true);
            let subreddit = args.join();
            let limit = Number(flagsFound.get("amount")) || 1;
            let time = flagsFound.get("time") || "all";
            let sort = flagsFound.get("sort") || "top";
            if (!subreddit)
                return Style_1.QuickEmbed(message, `no subreddit given`);
            if (limit > 10)
                limit = 10;
            message.channel.startTyping();
            const posts = yield Api_1.Reddit.Get(subreddit, sort, time, limit);
            message.channel.stopTyping(true);
            let msg = [];
            if (posts === undefined)
                return Style_1.QuickEmbed(message, `subreddit not found`);
            msg.push(`**Subreddit** *https://www.reddit.com/r/${posts.posts[0].subreddit}*\n`);
            if (message.channel.nsfw === false && posts.nsfw)
                return Style_1.QuickEmbed(message, `This is not a **NSFW** channel.  ${Emoji_1.sweat}`);
            posts.posts.map(p => {
                msg.push(`**${p.title}** *(${p.ups} upvotes)*  ${p.url}`);
            });
            MessageHandler_1.Send(msg.join("\n"));
        });
    }
};
module.exports = { command };
