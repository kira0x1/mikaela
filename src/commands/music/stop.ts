import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'stop',
    description: 'stops the music player',
    aliases: ['end', 's', 'dc', 'disconnect', 'leave', 'quit'],

    execute(message, args) {
        const player = getPlayer(message);
        if (player) {
            player.leave();
        }
    },
};
