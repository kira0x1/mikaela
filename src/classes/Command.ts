import { Message, PermissionResolvable } from 'discord.js';

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
    isDisabled?: boolean,
    userPerms?: PermissionResolvable,
    botPerms?: PermissionResolvable

    execute(message: Message, args: string[]): void;
}

declare type permission = 'admin' | 'kira'