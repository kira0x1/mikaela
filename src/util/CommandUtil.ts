import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { ICommand } from '../classes/Command';
import { CommandInfo } from '../classes/CommandInfo';
import { perms } from '../config';
import { wrap } from './style';

export const commands: Collection<string, ICommand> = new Collection()
export const commandGroups: Collection<string, ICommand[]> = new Collection();
export const commandInfos: Collection<string, CommandInfo> = new Collection()

export function InitCommands() {
    const infos: CommandInfo[] = []
    readdirSync(path.join(__dirname, '..', 'commands', 'info'))
        .map(file => {
            const { info } = require(path.join(__dirname, '..', "commands", 'info', file))
            infos.push(info)
        })

    readdirSync(path.join(__dirname, '..', "commands"))
        .filter(file => file.endsWith("js"))
        .map(file => {
            const { command } = require(path.join(__dirname, '..', "commands", file))
            const cmd: ICommand = command
            commands.set(cmd.name, cmd)
        })

    readdirSync(path.join(__dirname, '..', "commands"))
        .filter(folder => folder !== "info")
        .filter(file => file.endsWith(".js") === false)
        .map(folder => {
            const folderCommands: ICommand[] = []
            readdirSync(path.join(__dirname, '..', 'commands', folder))
                .map(file => {
                    const { command } = require(path.join(__dirname, '..', "commands", folder, file))
                    const cmd: ICommand = command
                    folderCommands.push(cmd)

                    if (!cmd.isSubCommand) {
                        commands.set(cmd.name.toLowerCase(), cmd)
                    }
                })

            if (folder) {
                commandGroups.set(folder, folderCommands)
            }

            const info = infos.find(cmd => cmd.name.toLowerCase() === folder)

            if (info) {
                const newInfo = new CommandInfo(info.name, info.description, info.aliases, commandGroups.get(info.name.toLowerCase()) || [])
                commandInfos.set(newInfo.name.toLowerCase(), newInfo);
            }
        })
}

export function FindCommand(query: string): ICommand | undefined {
    let command = commands.get(query.toLowerCase())
    if (!command) {
        const cmdArray = commands.array()
        command = cmdArray.find(cmd => cmd.aliases && cmd.aliases.find(al => al.toLowerCase() === query.toLowerCase()))
    }

    return command
}

export function FindCommandGroup(query: string) {
    let grp = commandGroups.get(query)
    if (!grp) {
        let infoFound = commandInfos.find(info => info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase()))
        if (infoFound) {
            grp = commandGroups.get(infoFound.name.toLowerCase())
        }
    }

    return grp
}

export function FindCommandInfo(query: string) {
    let infoFound = commandInfos.find(info => info.name.toLowerCase() === query.toLowerCase() || info.aliases.includes(query.toLowerCase()))
    return infoFound
}

export function GetUsage(query: string) {
    const command = FindCommand(query)
    if (!command) return console.log(`command: ${query} not found`)

    if (command.usage) {
        const usage = wrap(command.usage, "`")
        return usage
    }
}

export function HasPerms(userId: string, query: string) {
    const command = FindCommand(query)
    let hasPerm = true


    if (command && command.perms) {
        command.perms.map(permName => {
            const perm = perms.find(p => p.name === permName)
            if (perm) {
                hasPerm = perm.users.includes(userId)
            }
        })
    }

    if (!command) {
        const cmdInfo = commandInfos.get(query)
        if (cmdInfo) {
            if (cmdInfo.perms) {
                cmdInfo.perms.map(permName => {
                    const perm = perms.find(p => p.name === permName)
                    if (perm) {
                        hasPerm = perm.users.includes(userId)
                    }
                })
            }
        }
    }

    return hasPerm
}