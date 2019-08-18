import { Collection } from "discord.js";
import { Command } from "../objects/command";
import { Reddit } from "../util/Api";
import { CommandUtil } from "../util/CommandUtil";
import { getEmoji, sweat } from "../util/Emoji";
import { Send } from "../util/MessageHandler";
import { QuickEmbed } from "../util/Style";

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

const command: Command = {
  name: "reddit",
  description: "Posts reddit links",
  aliases: ["r", "rd"],
  usage: "[subreddit] optional: -sort -time -rank",
  args: true,
  flags: Flags,

  async execute(message, args) {
    const flagsFound: Collection<string, string> = CommandUtil.GetArgs(args, Flags, true);
    let subreddit = args.join();

    let limit = Number(flagsFound.get("amount")) || 1;
    let time = flagsFound.get("time") || "all";
    let sort = flagsFound.get("sort") || "top";

    if (!subreddit) return QuickEmbed(`no subreddit given`);
    if (limit > 10) limit = 10;

    message.channel.startTyping();
    const posts = await Reddit.Get(subreddit, sort, time, limit);
    message.channel.stopTyping(true);

    let msg: any = [];
    if (posts === undefined) return QuickEmbed(`subreddit not found`);

    msg.push(`**Subreddit** *https://www.reddit.com/r/${posts.posts[0].subreddit}*\n`);

    if (message.channel.nsfw === false && posts.nsfw) return QuickEmbed(`This is not a **NSFW** channel.  ${sweat}`);

    posts.posts.map(p => {
      msg.push(`**${p.title}** *(${p.ups} upvotes)*  ${p.url}`);
    });

    Send(msg.join("\n"));
  }
};

module.exports = { command };
