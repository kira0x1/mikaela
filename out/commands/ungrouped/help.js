"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var config_1 = require("../../config");
var commandUtil_1 = require("../../util/commandUtil");
var style_1 = require("../../util/style");
exports.command = {
    name: "Help",
    description: "Lists all commands",
    aliases: ["h"],
    execute: function (message, args) {
        var query = args.join(" ");
        if (!query) {
            displayAll(message);
        }
        else {
            displayOne(message, query);
        }
    }
};
function displayAll(message) {
    var grouped = [];
    //Add all grouped commands to the grouped array so we can cross
    //reference this later to check for ungrouped commands
    commandUtil_1.commandGroups.map(function (grp) {
        grp.map(function (cmd) {
            if (commandUtil_1.HasPerms(message.author.id, cmd.name) && !cmd.hidden)
                grouped.push(cmd);
        });
    });
    //Create embed
    var embed = new discord_js_1.RichEmbed();
    embed.setTitle("Commands");
    embed.setColor(style_1.embedColor);
    //Add all ungrouped commands to the embed
    var ungrouped = commandUtil_1.commandGroups.get("ungrouped");
    if (ungrouped) {
        ungrouped.map(function (cmd) {
            if (commandUtil_1.HasPerms(message.author.id, cmd.name) && !cmd.hidden)
                embed.addField(cmd.name, cmd.description);
        });
    }
    //Add all group commands info to the embed
    commandUtil_1.commandInfos.map(function (info) {
        if (commandUtil_1.HasPerms(message.author.id, info.name))
            embed.addField(info.name, info.description);
    });
    message.channel.send(embed);
}
function displayOne(message, query) {
    var command = commandUtil_1.FindCommand(query);
    var info = commandUtil_1.FindCommandInfo(query);
    if ((!command && !info) || !commandUtil_1.HasPerms(message.author.id, query)) {
        style_1.QuickEmbed(message, "Command not found");
    }
    else {
        //Create embed
        var embed_1 = new discord_js_1.RichEmbed();
        embed_1.setColor(style_1.embedColor);
        if (command) {
            InsertCommandEmbed(embed_1, command);
        }
        else if (info) {
            if (info.commands) {
                //Loop through all the commands in the CommandInfo class
                info.commands.map(function (cmd) {
                    var desc = cmd.description;
                    //Add aliases to the description
                    if (cmd.aliases) {
                        desc += "\naliases: " + style_1.wrap(cmd.aliases, "`");
                    }
                    if (cmd.usage) {
                        var usage = "";
                        if (cmd.isSubCommand) {
                            var cmdGroup_1 = "";
                            commandUtil_1.commandGroups.map(function (commands, group) {
                                if (commands.includes(cmd))
                                    cmdGroup_1 = group;
                            });
                            usage = style_1.wrap("" + config_1.prefix + cmdGroup_1 + " " + cmd.name + " " + cmd.usage, "`");
                        }
                        else {
                            usage = style_1.wrap("" + config_1.prefix + cmd.name + " " + cmd.usage, "`");
                        }
                        desc += "\n" + usage;
                    }
                    //Add command to the embed
                    embed_1.addField(cmd.name.toLowerCase(), desc);
                });
            }
        }
        //Send embed
        message.channel.send(embed_1);
    }
}
function InsertCommandEmbed(embed, command) {
    embed.setTitle(command.name);
    embed.setDescription(command.description);
    if (command.usage) {
        embed.addField("Usage", style_1.wrap(command.usage, "`"));
    }
    if (command.aliases) {
        var aliasesString = style_1.wrap(command.aliases, "`");
        embed.addField("aliases: ", aliasesString);
    }
    return embed;
}
