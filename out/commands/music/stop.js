"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
exports.command = {
    name: "stop",
    description: "stops the music player",
    aliases: ["end", "s"],
    execute: function (message, args) {
        var player = app_1.getPlayer(message);
        if (player) {
            player.leave();
        }
    }
};
