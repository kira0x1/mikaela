import { ICommand } from './Command';

export class CommandInfo {
    name: string;
    description: string;
    commands: ICommand[];
    aliases: string[];
    hidden: boolean = false;
    perms: string[] = [];
    requiresPrefix?: boolean;
    override: string = '';

    constructor(name: string, description: string, aliases: string[], commands: ICommand[], override?: string, perms?: string[]) {
        this.name = name;
        this.description = description;
        this.commands = commands;
        this.aliases = aliases;

        if (perms) this.perms = perms;
        if (override) this.override = override;
    }
}
