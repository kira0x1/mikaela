import chalk from 'chalk';
import { Message } from 'discord.js';

import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { findOrCreate } from '../../database/api/userApi';
import { getSong, sendSongNotFoundEmbed } from '../../util/apiUtil';
import { QuickEmbed } from '../../util/styleUtil';

const searchAliases = ["--search", "-search", "-s", "--s"]

export const command: ICommand = {
    name: 'remove',
    description: 'Remove a song from your favorites',
    aliases: ['delete', 'rem'],
    usage: '[Position | -s Search]',
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

    const user = await findOrCreate(message.author);

    if (index > user.favorites.length) {
        return QuickEmbed(message, 'Invalid position');
    }

    const song = user.favorites.splice(index - 1, 1).shift();
    user.save()

    if (!song) {
        return QuickEmbed(message, `Error while trying to remove song at ${index}`);
    }

    QuickEmbed(message, `Removed song **${song.title}** from your favorites`);
}


async function RemoveBySearch(query: string, message: Message) {
    const user = await findOrCreate(message.author);
    const song = await getSong(query)

    if (!song) {
        return sendSongNotFoundEmbed(message, query)
    }

    let hasRemovedSong = false

    for (let i = 0; i < user.favorites.length; i++) {
        const s = user.favorites[i]
        if (s.id !== song.id) continue;

        const songRemoved = user.favorites.splice(i, 1).shift()
        if (!songRemoved) return QuickEmbed(message, `Error while trying to remove song at ${i}`);
        logger.info(chalk.bgGreen.bold(`Deleting song ${s.title}`))
        user.save()
        hasRemovedSong = true;
        break;
    }

    if (hasRemovedSong) QuickEmbed(message, `Removed song **${song.title}** from your favorites`, true);
    else sendSongNotFoundEmbed(message, query)
}
