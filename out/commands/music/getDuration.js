"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
var discord_js_1 = require("discord.js");
exports.command = {
    name: 'GetDuration',
    description: 'Display the stream time',
    aliases: ['gd', 'time', 'elapsed'],
    execute: function (message, args) {
        var player = app_1.getPlayer(message);
        if (!player)
            return;
        var stream = player.getStream();
        if (stream && player.currentlyPlaying) {
            var streamTime = stream.time / 1000;
            var minutes = Math.floor(streamTime / 60);
            var seconds = streamTime - minutes * 60;
            var duration = player.currentlyPlaying.duration;
            var prettyTime = seconds.toFixed(0) + "s";
            if (minutes > 0) {
                prettyTime = minutes.toFixed(0) + ":" + seconds.toFixed(0) + "m";
            }
            var minutesLeft = Number(duration.minutes) - minutes;
            var secondsLeft = Number(duration.seconds) - seconds;
            var embed = new discord_js_1.RichEmbed();
            embed.setTitle("Time left: " + minutesLeft.toFixed(0) + ":" + secondsLeft.toFixed(0));
            embed.setDescription(prettyTime + " / " + duration.duration);
            message.channel.send(embed);
        }
    }
};
