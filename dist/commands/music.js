"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var Style_1 = require("../util/Style");
var song_1 = require("../objects/song");
var config_1 = require("../config");
var subcmd = [
    {
        name: "stop",
        aliases: ["quit", "end", "leave"],
        execute: function () {
            exports.player.Stop();
        }
    },
    {
        name: "skip",
        aliases: ["next", "fs"],
        execute: function () {
            exports.player.Skip();
        }
    },
    {
        name: "remove",
        aliases: ["rem", "cancel"],
        execute: function (message, args) {
            if (args) {
                var pos = args.shift();
                if (Number(pos))
                    exports.player.RemoveSong(Number(pos));
            }
        }
    },
    {
        name: "list",
        aliases: ["q", "ls"],
        execute: function () {
            exports.player.ListQueue();
        }
    },
    {
        name: "current",
        aliases: ["np", "c"],
        execute: function (message, args) {
            var currentSong = exports.player.queue.currentSong;
            if (!currentSong)
                return Style_1.QuickEmbed("No song currently playing");
            var embed = new discord_js_1.RichEmbed()
                .setTitle("currently playing **" + currentSong.title + "**")
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
    execute: function (message, args) {
        var query = args.join();
        if (query === "")
            return Style_1.QuickEmbed("" + config_1.prefix + this.usage);
        exports.player.AddSong(query, message);
    }
};
function playerInit() {
    exports.player = new song_1.Player();
}
exports.playerInit = playerInit;
