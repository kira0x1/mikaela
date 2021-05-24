import { Message, PermissionResolvable } from 'discord.js';

export interface Command {
   name: string;
   description: string;
   aliases?: string[];
   cooldown?: number;
   usage?: string;
   args?: boolean;
   hidden?: boolean;
   perms?: Permission[];
   isSubCommand?: boolean;
   isDisabled?: boolean;
   userPerms?: PermissionResolvable;
   botPerms?: PermissionResolvable;

   execute: (message: Message, args: string[]) => void;
}

export declare type Permission = 'admin' | 'mod' | 'kira';
