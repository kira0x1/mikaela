import { Message } from 'discord.js';

export enum Perms {
  banned = -1,
  user = 0,
  admin = 1
}

export class Flag {
  name: string
  description?: string
  aliases: Array<String> | undefined
  perms?: Perms | Perms.user

  constructor(flag: Flag) {
    this.name = flag.name
    this.description = flag.description
    this.aliases = flag.aliases
    this.perms = flag.perms
  }
}

export abstract class Command {
  name: string
  description?: string
  usage?: string | undefined
  aliases?: Array<string> | undefined
  flags?: Array<Flag> | undefined
  subCmd?: Command[]
  parent?: string
  args?: boolean | false
  cooldown?: number | 3
  perms?: string[]
  adminOnly?: boolean | false

  constructor(command: Command) {
    this.name = command.name
    this.description = command.description
    this.subCmd = command.subCmd
    this.flags = command.flags
    this.perms = command.perms
    this.usage = command.usage
    this.aliases = command.aliases
    this.args = command.args
    this.cooldown = command.cooldown
    this.adminOnly = command.adminOnly || false
  }

  static init(cmd: Command) {
    if (cmd.subCmd) cmd.subCmd.map(sc => sc.parent = cmd.name)
  }

  abstract execute(message: Message, args: Array<string>): void
  onFlag?(flag: Flag): void
  static CommandsDir(name: string): string {
    return `./subcommands/${name}/`
  }
}