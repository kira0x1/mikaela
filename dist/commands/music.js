"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("../config");
const song_1 = require("../objects/song");
const Style_1 = require("../util/Style");
const subcmd = [
    {
        name: "stop",
        aliases: ["quit", "end", "leave"],
        execute() {
            exports.player.Stop();
        }
    },
    {
        name: "skip",
        aliases: ["next", "fs"],
        execute(message) {
            exports.player.Skip(message);
        }
    },
    {
        name: "remove",
        aliases: ["rem", "cancel"],
        execute(message, args) {
            if (args) {
                let pos = args.shift();
                if (Number(pos))
                    exports.player.RemoveSong(message, Number(pos));
            }
        }
    },
    {
        name: "list",
        aliases: ["q", "ls"],
        execute(message, args) {
            exports.player.ListQueue(message);
        }
    },
    {
        name: "current",
        aliases: ["np", "c"],
        execute(message, args) {
            const currentSong = exports.player.queue.currentSong;
            if (!currentSong)
                return Style_1.QuickEmbed(message, `No song currently playing`);
            let embed = new discord_js_1.RichEmbed()
                .setTitle(`currently playing **${currentSong.title}**`)
                .setDescription(currentSong.duration.duration)
                .setColor(Style_1.embedColor);
            message.channel.send(embed);
        }
    }
];
exports.player = new song_1.Player();
exports.command = {
    name: "music",
    description: "Plays music",
    aliases: ["p", "play"],
    args: false,
    usage: "[Search | Link]",
    subCmd: subcmd,
    execute(message, args) {
        let query = args.join();
        if (query === "")
            return Style_1.QuickEmbed(message, `${config_1.prefix}${this.usage}`);
        exports.player.AddSong(query, message);
    }
};
function playerInit() {
    exports.player = new song_1.Player();
}
exports.playerInit = playerInit;
