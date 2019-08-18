import { Message } from "discord.js";

export class Flag {
  name: string;
  description?: string;
  aliases: Array<String> | undefined;

  constructor(flag: Flag) {
    this.name = flag.name;
    this.description = flag.description;
    this.aliases = flag.aliases;
  }
}

export abstract class Command {
  name: string;
  description?: string;
  usage?: string | undefined;
  aliases?: Array<string> | undefined;
  flags?: Array<Flag> | undefined;
  subCmd?: Array<Command> | undefined;
  args?: boolean | false;
  cooldown?: number | 3;
  perms?: string[];
  adminOnly?: boolean | false;

  constructor(command: Command) {
    this.name = command.name;
    this.description = command.description;
    this.subCmd = command.subCmd;
    this.flags = command.flags;
    this.perms = command.perms;
    this.usage = command.usage;
    this.aliases = command.aliases;
    this.args = command.args;
    this.cooldown = command.cooldown;
    this.adminOnly = command.adminOnly || false;
  }

  abstract execute(message: Message, args: Array<string>): void;
  onFlag?(flag: Flag): void;
  static CommandsDir(name: string): string {
    return `./subcommands/${name}/`;
  }
}

export abstract class SubCommand extends Command {
  name: string = "";
  description?: string | undefined;
  usage?: string | undefined;
  aliases?: Array<string> | undefined;
  args?: boolean | false;
  cooldown?: number | 3;
  adminOnly?: boolean | false;
  parent: Command | undefined;

  super?(command: SubCommand) {
    this.name = command.name;
    this.description = command.description;
    this.usage = command.usage;
    this.aliases = command.aliases;
    this.args = command.args;
    this.cooldown = command.cooldown;
    this.adminOnly = command.adminOnly;
  }
}
