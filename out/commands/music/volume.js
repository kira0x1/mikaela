"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("../../app");
var style_1 = require("../../util/style");
exports.command = {
    name: "volume",
    description: "Change the volume",
    aliases: ["v"],
    usage: "[- | + | number]\n\nDisplays the volume if no arguments given",
    execute: function (message, args) {
        var arg = args.shift();
        var player = app_1.getPlayer(message);
        if (!player)
            return;
        if (!arg)
            return style_1.QuickEmbed(message, "Volume is currently " + player.volume);
        var amount;
        if (arg === "-") {
            amount = player.volume - 0.5;
        }
        else if (arg === "+") {
            amount = player.volume + 0.5;
        }
        else if (Number(arg)) {
            amount = Number(arg);
        }
        if (amount) {
            player.changeVolume(amount, message);
        }
    }
};
