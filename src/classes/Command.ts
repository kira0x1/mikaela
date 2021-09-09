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

   // If this is true then the command group's prefix must be called first
   // for example if favorites/play.ts is set to true
   // then .fav play 3 must be called to call that command
   // this helps with conflicting commands. ( we have music/play.ts and favorites/play.ts )
   isSubCommand?: boolean;

   isDisabled?: boolean;
   userPerms?: PermissionResolvable;
   botPerms?: PermissionResolvable;

   execute: (message: Message, args: string[]) => void;
}

export declare type Permission = 'admin' | 'mod' | 'kira';
