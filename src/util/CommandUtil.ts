import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { admins, flagPrefix } from '../config';
import { Command, Flag, Perms } from '../objects/command';


const commands: Array<Command> = []

export function Init() {
  readdirSync("./dist/commands")
    .filter(file => file.endsWith("js"))
    .forEach(file => {
      const cmd = require(`../commands/${file}`)
      commands.push(cmd.command)
    })
}

export class CommandUtil {
  // #region Public Static Methods (5)

  public static FindFlag(name: string, flags: Array<Flag>): Flag | undefined {
    return flags.find(f => f.name === name || (f.aliases && f.aliases.includes(name)))
  }

  public static GetArgs(args: Array<string>, flags: Array<Flag>, strip?: boolean | false) {
    let flagsFound: Collection<string, string> = new Collection()

    args.map((arg, pos) => {
      if (arg.startsWith(flagPrefix)) {
        let flagName = args
          .splice(pos, 1)
          .toString()
          .slice(flagPrefix.length)

        let flagArgs = strip ? args.splice(pos, 1).toString() : ""

        const flag = this.FindFlag(flagName, flags)
        if (flag) flagsFound.set(flag.name, flagArgs)
      }
    })
    return flagsFound
  }

  public static GetCommand(name: string): Command | undefined {
    //Look for command
    const cmd: Command = commands.find(
      cmd => cmd.name === name || (cmd.aliases && cmd.aliases.includes(name))
    )

    if (cmd) return cmd

    //If no command found, then Check subcommands
    let subCmd = undefined
    commands.find(c => {
      if (c.subCmd) {
        subCmd = c.subCmd.find(
          subC => subC.name === name || (subC.aliases && subC.aliases.includes(name))
        )
      }
    })

    //Return subcommand
    return subCmd
  }

  public static GetCommands(): Command[] {
    return commands
  }

  public static HasPerms(userId: string, permsNeeded: Perms): boolean {
    if (permsNeeded === Perms.admin) {
      return admins.includes(userId)
    }
    return false
  }

  // #endregion Public Static Methods (5)
}
