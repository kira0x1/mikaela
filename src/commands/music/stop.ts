import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'stop',
    description: 'stops the music player',
    aliases: ['end', 's', 'disconnect'],

    execute(message, args) {
        const player = getPlayer(message);
        if (player) {
            player.leave();
        }
    },
};
