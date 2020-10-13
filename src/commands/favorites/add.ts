import { Message } from 'discord.js';

import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { CreateUser, IUser } from '../../db/dbUser';
import { getUser, updateUser } from '../../db/userController';
import { getSong } from '../../util/apiUtil';
import { QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'add',
    description: 'Add a song to your favorites',
    usage: '[search | url]',
    args: true,

    async execute(message, args) {
        const query = args.join();
        try {
            const song = await getSong(query);
            if (!song) return QuickEmbed(message, 'song not found');

            getUser(message.member.user.id)
                .then(user => AddFavorite(user, song, message))
                .catch(async err => {
                    //If user was not found create them
                    await CreateUser(message.member);

                    //Add favorite to the newly created user
                    getUser(message.member.user.id)
                        .then(user => {
                            AddFavorite(user, song, message);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                });
        } catch (err) {
            console.error(err)
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
