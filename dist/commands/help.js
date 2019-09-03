"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var CommandUtil_1 = require("../util/CommandUtil");
var Style_1 = require("../util/Style");
exports.command = {
    name: "help",
    description: "List Commands",
    aliases: ["h"],
    cooldown: 3,
    execute: function (message, args) {
        if (args.length === 0)
            HelpAll();
        else
            HelpCommand(message, args);
    }
};
function HelpAll() {
    var fields;
    fields = CommandUtil_1.CommandUtil.GetCommands().map(function (cmd) { return ({
        title: cmd.name,
        content: cmd.description + "\n \u200b",
        inline: false
    }); });
    Style_1.ListEmbed("Commands", undefined, fields);
}
function HelpCommand(message, args) {
    {
        var commandName = args.shift().toLowerCase();
        var command_1 = CommandUtil_1.CommandUtil.GetCommand(commandName);
        //Check if command is found
        if (!command_1)
            return Style_1.QuickEmbed("Command not found");
        //Create embed
        var embed = new discord_js_1.RichEmbed().setColor(Style_1.embedColor);
        embed.fields.push(Style_1.createField(command_1.name, command_1.description + "\n\u200B"));
        if (command_1.flags) {
            insertFlags(embed, command_1.flags);
        }
        else if (command_1.subCmd) {
            insertFlags(embed, command_1.subCmd);
        }
        message.channel.send(embed);
    }
}
function insertFlags(embed, children) {
    //Get amound of rows for flags
    var rows = Math.ceil(children.length / 3);
    var flagIndex = 0;
    console.log("about to enter for loop");
    //Add command flags
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < 3; col++) {
            if (flagIndex >= children.length) {
                embed.fields.push(Style_1.createEmptyField(true));
            }
            else {
                embed.fields.push(Style_1.createField(children[flagIndex].name, children[flagIndex].aliases.join(", "), true));
            }
            flagIndex++;
        }
    }
}
