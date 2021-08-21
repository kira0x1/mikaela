import { Command, Permission } from './Command';

export interface CommandInfo {
   name: string;
   description: string;
   commands: Command[];
   aliases: string[];
   perms?: Permission[];
   hidden?: boolean;
   requiresPrefix?: boolean;
   override?: string;
   paginate?: boolean;

   // when printing usage for command use this instead of the full command name
   // for example .fav play instead of .favorites play
   usageName?: string;
}
