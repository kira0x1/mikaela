import { ICommand } from './Command';

export interface CommandInfo {
    name: string;
    description: string;
    commands: ICommand[];
    aliases: string[];
    perms?: string[]
    hidden?: boolean;
    requiresPrefix?: boolean;
    override?: string;
}
