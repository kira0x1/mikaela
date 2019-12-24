"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
exports.command = {
    name: 'join',
    description: "Joins voice",
    execute: function (message, args) {
        //Get the guilds player
        var player = app_1.getPlayer(message);
        if (player) {
            //Join the VoiceChannel
            player.join(message);
        }
    }
};
