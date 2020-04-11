import { ICommand } from '../../classes/Command';

export const command: ICommand = {
   name: 'RemindBump',
   description: 'Sets a reminder to bump in 2 hours',
   aliases: ['rb'],
   perms: ['kira'],

   async execute(message, args) {},
};
