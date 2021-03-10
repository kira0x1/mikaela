import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { addFavoriteToUser } from '../../database/api/userApi';
import { getSong, isPlaylist } from '../../util/apiUtil';
import { QuickEmbed } from '../../util/styleUtil';


export const command: ICommand = {
    name: 'add',
    description: 'Add a song to your favorites',
    usage: '[search | url]',
    args: true,
    cooldown: 1,

    async execute(message, args) {
        const query = args.join();
        try {
            const song = await getSong(query);

            if (isPlaylist(song)) {
                QuickEmbed(message, "Cannot add playlists to your favorites... this feature is coming soon.")
                return
            }

            if (!song) return QuickEmbed(message, 'song not found');

            addFavoriteToUser(message.author, song, message)
        } catch (err) {
            logger.log('error', err);
        }
    },
};