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
const discord_js_1 = require("discord.js");
const ms_1 = __importDefault(require("ms"));
const Style_1 = require("../util/Style");
const CommandUtil_1 = require("../util/CommandUtil");
const voteEmojis = [
    { name: 'one' },
    { name: 'two' },
    { name: 'three' },
    { name: 'four' },
    { name: 'five' },
    { name: 'six' },
    { name: 'seven' },
    { name: 'eight' },
    { name: 'nine' },
];
const flags = [
    {
        name: 'title',
        description: 'Strawpoll title',
        aliases: ['t']
    }
];
const command = {
    name: 'vote',
    description: 'Create a strawpoll',
    aliases: ['v', 'createvote', 'cr'],
    usage: `[Vote Option 1, 2 ,3...]`,
    cooldown: 5,
    args: true,
    flags: flags,
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const flagsFound = CommandUtil_1.CommandUtil.GetArgs(args, flags, true);
            let title = flagsFound.get("title") || `${message.author.username}'s strawpoll`;
            const options = [];
            const embed = new discord_js_1.RichEmbed()
                .setTitle(title)
                .setColor(Style_1.embedColor);
            args.join(" ").split(",").map((op, index) => {
                options.push(op);
                embed.addField(`${op}`, `${index + 1}`, true);
            });
            //If options is greater then 9 then return an error embed
            if (options.length > 9) {
                const errorEmbed = new discord_js_1.RichEmbed()
                    .setTitle("Maximum vote options 9")
                    .setColor(Style_1.embedColor);
                return message.channel.send(errorEmbed);
            }
            //send the normal embed
            message.channel.send(embed).then((msg) => __awaiter(this, void 0, void 0, function* () {
                if (!((msg) => msg instanceof discord_js_1.Message)(msg))
                    return;
                const filter = (reaction, user) => {
                    return !user.bot;
                };
                const collector = msg.createReactionCollector(filter, { time: ms_1.default("2h") });
                collector.on('collect', (reaction) => __awaiter(this, void 0, void 0, function* () {
                }));
                for (let i = 0; i < options.length; i++) {
                    const emoji = msg.client.emojis.find(emoji => emoji.name === voteEmojis[i].name);
                    yield msg.react(emoji.id);
                }
            }));
        });
    }
};
module.exports = { command };
