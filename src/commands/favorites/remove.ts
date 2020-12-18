import { Message } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { CreateUser } from '../../db/dbUser';
import { getUser, updateUser } from '../../db/userController';
import { getSong } from '../../util/apiUtil';
import { QuickEmbed } from '../../util/styleUtil';

const searchAliases = ["--search", "-search", "-s", "--s"]

export const command: ICommand = {
    name: 'remove',
    description: 'Remove a song from your favorites',
    aliases: ['delete', 'rem'],
    usage: '[Position | Search]',
    cooldown: 1.5,

    async execute(message, args) {
        let firstArg = args[0]

        if (searchAliases.includes(firstArg)) {
            args.shift()
            RemoveBySearch(args.join(' '), message)
        } else {
            RemoveByIndex(args, message)
        }
    },
};

async function RemoveByIndex(args: string[], message: Message) {
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
}


async function RemoveBySearch(query: string, message: Message) {
    const user = await getUser(message.member.user.id);
    if (!user) {
        CreateUser(message.member);
        return QuickEmbed(message, 'You have no favorites');
    }

    const song = await getSong(query)

    if (!song) {
        return QuickEmbed(message, `Song not found: "${query}"`)
    }

    let hasRemovedSong = false

    for (let i = 0; i < user.favorites.length; i++) {
        const s = user.favorites[i]
        if (s.id !== song.id) continue;

        const songRemoved = user.favorites.splice(i, 1).shift()
        if (!songRemoved) return QuickEmbed(message, `Error while trying to remove song at ${i}`);
        updateUser(user.id, user);
        hasRemovedSong = true;
        break;
    }

    if (hasRemovedSong)
        QuickEmbed(message, `Removed song **${song.title}** from your favorites`);
}
