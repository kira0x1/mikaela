import { Message } from 'discord.js';

export interface ICommand {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
    args?: boolean;
    hidden?: boolean;
    perms?: string[];
    isSubCommand?: boolean;
    requireUser?: boolean;

    execute(message: Message, args: string[]): void;
}
