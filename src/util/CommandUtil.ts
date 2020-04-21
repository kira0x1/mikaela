import { Collection, Message } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';

import { ICommand } from '../classes/Command';
import { CommandInfo } from '../classes/CommandInfo';
import { perms } from '../config';
import { QuickEmbed, wrap } from './Style';

export const commands: Collection<string, ICommand> = new Collection();
export const commandGroups: Collection<string, ICommand[]> = new Collection();
export const commandInfos: Collection<string, CommandInfo> = new Collection();

export function initCommands() {
    const infos: CommandInfo[] = [];
    readdirSync(path.join(__dirname, '..', 'commands', 'info')).map(file => {
        const { info } = require(path.join(__dirname, '..', 'commands', 'info', file));
        infos.push(info);
    });

    readdirSync(path.join(__dirname, '..', 'commands'))
        .filter(file => file.endsWith('js'))
        .map(file => {
            const { command } = require(path.join(__dirname, '..', 'commands', file));
            const cmd: ICommand = command;
            commands.set(cmd.name, cmd);
        });

    readdirSync(path.join(__dirname, '..', 'commands'))
        .filter(folder => folder !== 'info')
        .filter(file => file.endsWith('.js') === false)
        .map(folder => {
            const folderCommands: ICommand[] = [];
            readdirSync(path.join(__dirname, '..', 'commands', folder)).map(file => {
                const { command } = require(path.join(__dirname, '..', 'commands', folder, file));
                const cmd: ICommand = command;
                folderCommands.push(cmd);

                if (!cmd.isSubCommand) {
                    commands.set(cmd.name.toLowerCase(), cmd);
                }
            });

            if (folder) {
                commandGroups.set(folder, folderCommands);
            }

            const info = infos.find(cmd => cmd.name.toLowerCase() === folder);
            if (info) {
                const newInfo = new CommandInfo(
                    info.name,
                    info.description,
                    info.aliases,
                    commandGroups.get(info.name.toLowerCase()) || [],
                    info.override,
                    info.perms
                );
                commandInfos.set(newInfo.name.toLowerCase(), newInfo);
            }
        });
}

export function findCommand(query: string): ICommand | undefined {
    let command = commands.get(query.toLowerCase());
    if (!command) {
        const cmdArray = commands.array();
        command = cmdArray.find(cmd => cmd.aliases && cmd.aliases.find(al => al.toLowerCase() === query.toLowerCase()));
    }

    return command;
}

export function getCommandOverride(query: string): ICommand | undefined {
    const info = commandInfos.find(
        cmd_info => cmd_info.name.toLowerCase() === query || cmd_info.aliases.includes(query.toLowerCase())
    );

    if (info) {
        if (!info.override) return;
        const grp = findCommandGroup(info.name);
        if (grp) return grp.find(cmd => cmd.name.toLowerCase() === info.override.toLowerCase());
    }
}

export function findCommandGroup(query: string) {
    let grp = commandGroups.get(query);
    if (!grp) {
        const info = commandInfos.find(
            info => info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase())
        );
        if (info) grp = info.commands;
    }
    return grp;
}

export function findCommandInfo(query: string) {
    let infoFound = commandInfos.find(
        info => info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase())
    );
    return infoFound;
}

export function getUsage(query: string) {
    const command = findCommand(query);
    if (!command) return console.log(`command: ${query} not found`);

    if (command.usage) {
        const usage = wrap(command.usage, '`');
        return usage;
    }
}

export function hasPerms(userId: string, query: string): boolean {
    //Get ID's
    const permsFound = findCommandInfo(query)?.perms || findCommand(query)?.perms;

    //If none set then this command does not require permissions to use
    if (!permsFound || permsFound.length === 0) return true;

    for (let i = 0; i < permsFound.length; i++) {
        const permName = permsFound[i].toLowerCase();
        const perm = perms.find(p => p.name.toLowerCase() === permName);
        if (perm?.users.includes(userId)) return true;
    }

    return false;
}

export function sendUsage(message: Message, commandName: string, fallbackUsage: string = 'Error: Please check your arguments') {
    QuickEmbed(message, getUsage(commandName) || fallbackUsage);
}
