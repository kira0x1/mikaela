import { ICommand, Permission } from './Command';

export interface CommandInfo {
   name: string;
   description: string;
   commands: ICommand[];
   aliases: string[];
   perms?: Permission[];
   hidden?: boolean;
   requiresPrefix?: boolean;
   override?: string;
}
