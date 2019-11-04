import { Collection } from "discord.js";
import { readdirSync, chmod } from "fs";
import { flagPrefix } from "../config";
import { Command, Flag } from "../objects/command";
import { playerInit } from "../commands/music";
import chalk from 'chalk'
import path from "path";

const commands: Array<Command> = [];

export function Init() {
  playerInit();
  readdirSync(path.join(__dirname, "..", "commands"))
    .filter(file => file.endsWith("js"))
    .forEach(file => {
      const cmd = require(path.join(__dirname, "..", "commands", file));
      commands.push(cmd.command)
    });
}

export class CommandUtil {
  public static GetCommand(name: string): Command | undefined {
    console.log(`Get command called for ${name}`)

    //Look for command
    const cmd = commands.find(cmd => cmd.name === name || (cmd.aliases && cmd.aliases.includes(name)));
    if (cmd) console.log(`Found command ${cmd.name}`)
    if (cmd) return cmd;
    //If no command found, then Check subcommands

    let subCmd = undefined;
    commands.find(c => {
      if (c.subCmd) subCmd = c.subCmd.find(subC => subC.name === name || (subC.aliases && subC.aliases.includes(name)));
    });

    if (!subCmd) return undefined

    console.log(`subcommand: ${subCmd.name}`)

    //Return subcommand
    return subCmd;
  }

  public static GetCommands(): Command[] {
    return commands;
  }

  public static FindFlag(name: string, flags: Array<Flag>): Flag | undefined {
    return flags.find(f => f.name === name || (f.aliases && f.aliases.includes(name)));
  }

  public static GetArgs(args: Array<string>, flags: Array<Flag>, strip?: boolean | false) {
    let flagsFound: Collection<string, string> = new Collection();

    args.map((arg, pos) => {
      if (arg.startsWith(flagPrefix)) {
        let flagName = args
          .splice(pos, 1)
          .toString()
          .slice(flagPrefix.length);

        let flagArgs = strip ? args.splice(pos, 1).toString() : "";

        const flag = this.FindFlag(flagName, flags);
        if (flag) flagsFound.set(flag.name, flagArgs);
      }
    });
    return flagsFound;
  }
}

// const logger = createLogger({
// level: "info",
// format: format.combine(format.errors({ stack: true }), format.splat(), format.json()),
// transports: [
// new transports.Console({
// format: format.combine(format.colorize(), format.simple())
// })
// ]
// });

// export function log(content: string) {
// logger.info(content);
// }
