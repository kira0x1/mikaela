"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Flag {
    constructor(flag) {
        this.name = flag.name;
        this.description = flag.description;
        this.aliases = flag.aliases;
    }
}
exports.Flag = Flag;
class Command {
    // wip?: boolean | false;
    constructor(command) {
        this.name = command.name;
        this.description = command.description;
        this.subCmd = command.subCmd;
        this.flags = command.flags;
        // this.wip = command.wip;
        this.perms = command.perms;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.args = command.args;
        this.cooldown = command.cooldown;
        this.adminOnly = command.adminOnly || false;
    }
    static CommandsDir(name) {
        return `./subcommands/${name}/`;
    }
}
exports.Command = Command;
class SubCommand extends Command {
    constructor() {
        super(...arguments);
        this.name = "";
    }
    super(command) {
        this.name = command.name;
        this.description = command.description;
        this.usage = command.usage;
        this.aliases = command.aliases;
        this.args = command.args;
        this.cooldown = command.cooldown;
        this.adminOnly = command.adminOnly;
    }
}
exports.SubCommand = SubCommand;
