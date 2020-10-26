import { Message } from 'discord.js';

import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { CreateUser, IUser } from '../../db/dbUser';
import { getUser, updateUser } from '../../db/userController';
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

            let user = await getUser(message.member.user.id)
            if (!user) {
                await CreateUser(message.member)
                user = await getUser(message.member.user.id)
                if (user) AddFavorite(user, song, message)
            }
            else {
                AddFavorite(user, song, message)
            }
        } catch (err) {
            console.error(err);
        }
    },
};

export function AddFavorite(user: IUser, song: ISong, message: Message) {
    if (user.favorites && user.favorites.find(fav => fav.id === song.id)) {
        return QuickEmbed(message, `Sorry **${user.username}** You already have this song as a favorite`);
    } else {
        QuickEmbed(message, `**${user.username}** added song **${song.title}** to their favorites!`);
        user.favorites.push(song);
        updateUser(message.member.user.id, user);
    }
}
