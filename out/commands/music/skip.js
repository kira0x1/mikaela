"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var app_1 = require("../../app");
var style_1 = require("../../util/style");
exports.command = {
    name: "Skip",
    description: "Skip song",
    aliases: ['fs', 'next'],
    execute: function (message, args) {
        //Get the guilds player
        var player = app_1.getPlayer(message);
        if (player) {
            //Get the current playing song
            var currentSong = player.currentlyPlaying;
            if (currentSong) {
                //Create an embed with the information of the song to be skipped
                var embed = new discord_js_1.RichEmbed();
                embed.setColor(style_1.embedColor)
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setTitle("Skipped Song: " + currentSong.title)
                    .setDescription(currentSong.url);
                message.channel.send(embed);
            }
            player.skipSong();
        }
    }
};
