import { Message, MessageEmbed } from 'discord.js';

import { ICommand } from '../../classes/Command';
import { prefix } from '../../config';
import { commandGroups, commandInfos, findCommand, findCommandInfo, hasPerms } from '../../util/commandUtil';
import { createDeleteCollector } from '../../util/musicUtil';
import { embedColor, wrap, createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Help',
    description: 'Lists all commands',
    aliases: ['h'],

    execute(message, args) {
        const query = args.join(' ');
        if (!query) {
            displayAll(message);
        } else {
            displayOne(message, query);
        }
    },
};

async function displayAll(message: Message) {
    const grouped: ICommand[] = [];

    //Add all grouped commands to the grouped array so we can cross
    //reference this later to check for ungrouped commands
    commandGroups.map(grp => {
        grp.map(cmd => {
            if (hasPerms(message.member, cmd.name) && !cmd.hidden && !cmd.isDisabled) grouped.push(cmd);
        });
    });

    //Create embed
    const embed = createFooter(message)
        .setTitle(`Commands`)
        .setDescription(`For information about a command or category\n**${prefix}help [command]**`)

    //Add all ungrouped commands to the embed
    const ungrouped = commandGroups.get('ungrouped');
    if (ungrouped) {
        ungrouped.map(cmd => {
            if (hasPerms(message.member, cmd.name) && !cmd.hidden)
                embed.addField(cmd.name, cmd.description, true);
        });
    }

    //Add all group commands info to the embed
    commandInfos.map(info => {
        if (hasPerms(message.member, info.name)) embed.addField(info.name, info.description, true);
    });

    const msg = await message.channel.send(embed);
    createDeleteCollector(msg, message)
}

async function displayOne(message: Message, query: string) {
    //Look for Command
    const command = findCommand(query);

    //Get command info
    const info = findCommandInfo(query);

    //If command was not found or if the user doesnt have permission then respond with Command not found
    if (!command && !info) {
        message.author.send(`Command ${wrap(query)} not found`);
        return;
    }

    if (!hasPerms(message.member, query))
        return message.author.send(`You do not have permission to use ${wrap(command?.name || info?.name)}`);

    //Create embed
    const embed = new MessageEmbed().setColor(embedColor);

    //If we have the command
    if (command) {
        if (command.isDisabled) {
            embed.setTitle('This command is disabled at the moment');
        } else {
            InsertCommandEmbed(embed, command);
        }

        return message.channel.send(embed);
    }

    //? If we dont have the command, then it must be an info group
    //If the info group doesnt have any commands exit out
    if (!info.commands) return;

    //Loop through all the commands in the CommandInfo class
    info.commands
        .filter(cmd => !cmd.isDisabled)
        .map(cmd => {
            let desc = cmd.description;

            //Add aliases to the description
            if (cmd.aliases) {
                desc += `\naliases: ${wrap(cmd.aliases, '`')}`;
            }

            desc += `\n${getUsage(cmd)}`;

            //Add command to the embed
            embed.addField(cmd.name.toLowerCase(), desc);
        });

    //Send embed
    const msg = await message.channel.send(embed);
    createDeleteCollector(msg, message)
}

function getUsage(command: ICommand): string {
    let usage = ``;
    if (command.isSubCommand) {
        let cmdGroup = '';

        commandGroups.map((commands, group) => {
            if (commands.includes(command)) cmdGroup = group;
        });

        usage = wrap(`${prefix}${cmdGroup} ${command.name} ${command.usage}`, '`');
    } else if (command.usage) {
        usage = wrap(`${prefix}${command.name} ${command.usage}`, '`');
    }

    return usage;
}

function InsertCommandEmbed(embed: MessageEmbed, command: ICommand) {
    embed.setTitle(command.name);
    embed.setDescription(command.description);

    if (command.usage) {
        embed.addField('Usage', wrap(command.usage, '`'));
    }

    if (command.aliases) {
        const aliasesString = wrap(command.aliases, '`');
        embed.addField('aliases: ', aliasesString);
    }
    return embed;
}
