import { ICommand } from '../../classes/Command';
import { CreateUser } from '../../db/dbUser';
import { getUser, updateUser } from '../../db/userController';
import { QuickEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'remove',
    description: 'Remove a song from your favorites',
    aliases: ['delete', 'rem'],
    usage: '[Position | Search]',

    async execute(message, args) {
        const index = Number(args.shift());
        if (!index) return QuickEmbed(message, 'Invalid position');
        const user = await getUser(message.member.user.id);
        if (!user) {
            CreateUser(message.member);
            return QuickEmbed(message, 'You have no favorites');
        } else {
            if (index > user.favorites.length) {
                return QuickEmbed(message, 'Invalid position');
            } else {
                const song = user.favorites.splice(index - 1, 1).shift();
                updateUser(user.id, user);
                if (!song) {
                    return QuickEmbed(message, `Error while trying to remove song at ${index}`);
                }

                QuickEmbed(message, `Removed song **${song.title}** from your favorites`);
            }
        }
    },
};
