import { Collection, Constants, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';

import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { findOrCreate } from '../../database/api/userApi';
import { IUser } from '../../database/models/User';
import { getTarget } from '../../util/discordUtil';
import { createDeleteCollector } from '../../util/musicUtil';
import { createFooter, embedColor, quickEmbed } from '../../util/styleUtil';

const favlistCalls: Collection<string, Message> = new Collection();
const songsPerPage = 5;

export const command: ICommand = {
    name: 'list',
    description: 'Lists your favorites or someone elses',
    aliases: ['ls'],
    usage: '[empty | user]',
    isSubCommand: true,
    cooldown: 1,

    async execute(message, args) {

        let target = message.author
        if (args.length > 0) target = await getTarget(message, args.join(' '));

        if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``)

        const user = await findOrCreate(target);

        if (!user || !user.favorites || user.favorites.length === 0) {
            const embed: MessageEmbed = createFooter(message)
                .setTitle(target.username + '\n\u200b')
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .setDescription('Favorites: none')
                .setColor(embedColor);
            return message.channel.send(embed);
        }

        ListFavorites(message, target, user);
    },
};

export async function updateFavList(userId: string) {
    const lastFav = favlistCalls.get(userId)
    if (!lastFav) return

}

function createFavListEmbed(target: User, user: IUser, pages: Collection<number, Song[]>, pageAt = 0) {
    let title = `**Favorites**\nPage **${pageAt + 1} / ${pages.size}**`;
    title += `\nSongs **${user.favorites.length}**`;
    title += '\n\u200b';

    const embed = new MessageEmbed()
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setColor(embedColor)
        .setTitle(title)


    const page = pages.get(pageAt);
    if (!page) {
        logger.warn(`Could not get page: ${pageAt} for user ${user.username}`)
        return
    }

    page.map((song, index) => {
        const num = `**${pageAt * songsPerPage + (index + 1)}**`;
        let content = `Duration: ${song.duration.duration}  ${song.url}`;
        let title = `${num} **${song.title}**`;

        embed.addField(title, content);
    });

    return embed
}

function getPages(songs: Song[]) {
    const pages: Collection<number, Song[]> = new Collection();

    let count = 0;
    let pageAtInLoop = 0;
    pages.set(0, []);

    for (let i = 0; i < songs.length; i++) {
        if (count >= songsPerPage) {
            count = 0;
            pageAtInLoop++;
            pages.set(pageAtInLoop, []);
        }

        const pageSongs = pages.get(pageAtInLoop);
        if (pageSongs) pageSongs.push(songs[i]);

        count++;
    }

    return pages;
}

async function ListFavorites(message: Message, target: User, user: IUser) {

    const songs = user.favorites;
    const pages = getPages(songs)

    const embed = createFavListEmbed(target, user, pages)

    const msg = await message.channel.send(embed);
    favlistCalls.set(message.author.id, msg)

    //If there are only 1 or none pages then dont add the next, previous page emojis / collector
    if (pages.size <= 1) {
        createDeleteCollector(msg, message)
        return;
    }

    msg.react('⬅').then(() => msg.react('➡')).finally(() => createDeleteCollector(msg, message))


    const filter = (reaction: MessageReaction, userReacted: User) => {
        return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !userReacted.bot;
    };

    const collector = msg.createReactionCollector(filter, { time: ms('3h') });

    let currentPage = 0;

    collector.on('collect', async (reaction: MessageReaction, userReacted: User) => {
        if (reaction.emoji.name === '➡') {
            currentPage++;
            if (currentPage >= pages.size) currentPage = 0;
        } else if (reaction.emoji.name === '⬅') {
            currentPage--;
            if (currentPage < 0) currentPage = pages.size - 1;
        }

        reaction.users.remove(userReacted);

        const newEmbed = createFavListEmbed(target, user, pages, currentPage);

        msg.edit(newEmbed);
    });

    collector.on('end', collected => {
        msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE)
                logger.error(error)
        })
    })
}
