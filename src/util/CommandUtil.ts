import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { createLogger, format, transports } from 'winston';
import { flagPrefix } from '../config';
import { Command, Flag } from '../objects/command';

const commands: Array<Command> = []
const coolDowns: Collection<string, Collection<string, number>> = new Collection()

export function Init() {
    readdirSync('./dist/commands')
        .filter(file => file.endsWith('js'))
        .forEach(file => {
            const cmd = require(`../commands/${file}`)
            commands.push(cmd.command)
        })
}

export class CommandUtil {
    public static GetCommand(name: string) {
        return commands.find(
            cmd =>
                cmd.name === name ||
                (cmd.aliases && cmd.aliases.includes(name)) ||
                (cmd.flags && this.FindFlag(name, cmd.flags))
        )
    }

    public static GetCommands(): Command[] {
        return commands
    }

    public static FindFlag(name: string, flags: Array<Flag>): Flag | undefined {
        return flags.find(f => f.name === name || (f.aliases && f.aliases.includes(name)))
    }

    public static GetArgs(args: Array<string>, flags: Array<Flag>) {
        let flagsFound: Collection<string, string> = new Collection()

        args.map((arg, pos) => {
            if (arg.startsWith(flagPrefix)) {
                let flagName = args
                    .splice(pos, 1)
                    .toString()
                    .slice(flagPrefix.length)

                let flagArgs = args.splice(pos, 1).toString()

                const flag = this.FindFlag(flagName, flags)
                if (flag) flagsFound.set(flag.name, flagArgs)
            }
        })
        return flagsFound
    }
}

const logger = createLogger({
    level: 'info',
    format: format.combine(format.errors({ stack: true }), format.splat(), format.json()),
    transports: [
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
})

export function log(content: string) {
    logger.info(content)
}
