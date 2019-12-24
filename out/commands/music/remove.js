"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
var style_1 = require("../../util/style");
var discord_js_1 = require("discord.js");
var queue_1 = require("./queue");
exports.command = {
    name: "remove",
    description: "Remove a song from queue",
    usage: "[position in queue]",
    aliases: ["r"],
    execute: function (message, args) {
        var player = app_1.getPlayer(message);
        if (!player)
            return;
        var arg1 = args.shift();
        if (!arg1)
            return;
        if (Number(arg1) === NaN) {
            style_1.QuickEmbed(message, "Invalid position");
        }
        else {
            var pos = Number(arg1);
            if (pos > player.queue.songs.length + 1) {
                return style_1.QuickEmbed(message, "Invalid position");
            }
            else {
                var song = player.queue.removeAt(pos - 1).shift();
                if (!song)
                    return style_1.QuickEmbed(message, "Couldnt find song");
                var embed = new discord_js_1.RichEmbed()
                    .setColor(style_1.embedColor)
                    .setTitle("Removed song " + song.title)
                    .setAuthor(message.author.username, message.author.avatarURL);
                message.channel.send(embed);
                var lastQueueCall = queue_1.queueCalls.get(message.author.id);
                if (lastQueueCall) {
                    var queueEmbed = queue_1.getQueue(message);
                    lastQueueCall.edit(queueEmbed);
                }
            }
        }
    }
};
