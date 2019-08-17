import { Command } from "../objects/command";
import { Reddit } from "../util/Api";
import { Send } from "../util/MessageHandler";
import { Collection } from "discord.js";
import { CommandUtil, log } from "../util/CommandUtil";
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
    const flagsFound: Collection<string, string> = await CommandUtil.GetArgs(args, Flags);

    let subreddit = args.join();

    let limit = Number(flagsFound.get("amount")) || 1;
    let time = flagsFound.get("time") || "all";
    let sort = flagsFound.get("sort") || "top";

    if (!subreddit) return QuickEmbed(`no subreddit given`);

    log(`subreddit: ${subreddit} limit: ${limit} , sort: ${sort}, time: ${time}`);
    log(`args: ${args}`);

    if (limit > 10) limit = 10;

    message.channel.startTyping();

    const posts = await Reddit.Get(subreddit, sort, time, limit);

    let msg: any = [];
    msg.push(`**Subreddit** *https://www.reddit.com/r/${posts.posts[0].subreddit}*\n`);

    if (message.channel.nsfw === false && posts.nsfw)
      return QuickEmbed("This is not a **NSFW** channel.");

    posts.posts.map(p => {
      msg.push(`**${p.title}** *(${p.ups} upvotes)*  ${p.url}`);
    });

    message.channel.stopTyping();
    Send(msg.join("\n"));
  }
};

module.exports = { command };
