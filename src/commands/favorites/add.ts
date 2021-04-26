import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { addFavoriteToUser } from '../../database/api/userApi';
import { getSong, isPlaylist } from '../../util/apiUtil';
import { quickEmbed } from '../../util/styleUtil';


export const command: ICommand = {
    name: 'add',
    description: 'Add a song to your favorites',
    usage: '[search | url]',
    args: true,
    cooldown: 1,
    isSubCommand: true,

    async execute(message, args) {
        const query = args.join();
        try {
            const song = await getSong(query);
            if (!song) return quickEmbed(message, 'song not found');

            if (isPlaylist(song)) {
                quickEmbed(message, "Cannot add playlists to your favorites... this feature is coming soon.", { autoDelete: true })
                return
            }

            addFavoriteToUser(message.author, song, message)
        } catch (error) {
            logger.error(error);
        }
    },
};