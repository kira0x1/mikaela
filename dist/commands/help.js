"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandUtil_1 = require("../util/CommandUtil");
const Style_1 = require("../util/Style");
exports.command = {
    name: "help",
    description: "List Commands",
    aliases: ["h"],
    cooldown: 3,
    execute(message, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.length === 0 || !args)
                HelpAll(message);
            else
                HelpCommand(message, args);
        });
    }
};
function HelpAll(message) {
    let fields;
    fields = CommandUtil_1.CommandUtil.GetCommands().map(cmd => ({
        title: cmd.name,
        content: cmd.description + "\n \u200b",
        inline: false
    }));
    Style_1.ListEmbed(message, "Commands", undefined, fields);
}
function HelpCommand(message, args) {
    {
        const commandName = args.shift().toLowerCase();
        const command = CommandUtil_1.CommandUtil.GetCommand(commandName);
        //Check if command is found
        if (!command)
            return Style_1.QuickEmbed(message, `Command not found`);
        //Create embed
        const embed = new discord_js_1.RichEmbed().setColor(Style_1.embedColor);
        embed.fields.push(Style_1.createField(command.name, command.description + `\n\u200b`));
        if (command.flags) {
            insertFlags(embed, command.flags);
        }
        else if (command.subCmd) {
            insertFlags(embed, command.subCmd);
        }
        message.channel.send(embed);
    }
}
function insertFlags(embed, children) {
    //Get amound of rows for flags
    const rows = Math.ceil(children.length / 3);
    let flagIndex = 0;
    console.log(`about to enter for loop`);
    //Add command flags
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < 3; col++) {
            if (flagIndex >= children.length) {
                embed.fields.push(Style_1.createEmptyField(true));
            }
            else {
                let aliases = 'aliases: none';
                if (children[flagIndex].aliases !== undefined)
                    aliases = children[flagIndex].aliases.join(", ");
                embed.fields.push(Style_1.createField(children[flagIndex].name, aliases, true));
            }
            flagIndex++;
        }
    }
}
