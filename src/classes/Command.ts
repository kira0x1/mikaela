import { Message } from 'discord.js';

export interface ICommand {
    name: string;
    description: string;
    aliases?: string[];
    cooldown?: number,
    usage?: string;
    args?: boolean;
    hidden?: boolean;
    perms?: permission[];
    isSubCommand?: boolean,
    isDisabled?: boolean

    execute(message: Message, args: string[]): void;
}

declare type permission = 'admin' | 'kira'