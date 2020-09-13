import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';
import { getSong } from '../../util/apiUtil';
import { QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Add',
    description: 'Add song to queue',

    async execute(message, args) {
        //Get the guilds player
        const player = getPlayer(message);

        if (player) {
            const query = args.join(' ');

            //Get song
            getSong(query)
                .then(song => player.queue.addSong(song)) //? If the song is found add it to the queue
                .catch(err => QuickEmbed(message, 'Song not found'));
        }
    },
};
