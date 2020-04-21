import { ICommand } from '../../classes/Command';
import { setReminder } from '../ungrouped/reminder';

export const command: ICommand = {
    name: 'RemindBump',
    description: 'Sets a reminder to bump in 2 hours',
    aliases: ['rb'],
    perms: ['kira'],

    async execute(message, args) {
        setReminder(message, '2h', 'Bump');
    },
};
