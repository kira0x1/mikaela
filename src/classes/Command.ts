import { SlashCommandIntegerOption, SlashCommandStringOption } from '@discordjs/builders';
import { CommandInteraction, Message, PermissionResolvable } from 'discord.js';

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

   /**
    * whether this command can be also used as an interaction
    */
   hasInteraction?: boolean;
   interactionOptions?: Array<SlashCommandStringOption | SlashCommandIntegerOption>;

   execute: (message: Message, args: string[]) => void;
   executeInteraction?: (interaction: CommandInteraction) => void;
}

export declare type Permission = 'admin' | 'mod' | 'kira';
