import { Collection, Constants, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { ICommand } from '../../classes/Command';
import { Song } from "../../classes/Song";
import { IUser } from '../../database/models/User';
import { findOrCreate } from '../../database/api/userApi';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';
import { getTarget } from '../../util/discordUtil';
import { createDeleteCollector } from '../../util/musicUtil';
import { logger } from '../../app';

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

        if (!target) return QuickEmbed(message, `Could not find user \`${args.join(' ')}\``)

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

async function ListFavorites(message: Message, target: User, user: IUser) {
    const songs = user.favorites;
    const songsPerPage = 5;
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

    let pageAt = 0;
    const embed = new MessageEmbed().setColor(embedColor).setThumbnail(target.displayAvatarURL({ dynamic: true }));

    let title = `**Favorites**\nPage **${pageAt + 1} / ${pages.size}**`;
    title += `\nSongs **${user.favorites.length}**`;
    title += '\n\u200b';

    embed.setTitle(title);

    const page = pages.get(pageAt);
    if (page) {
        page.map((song, index) => {
            const num = `**${index + 1}**  `;
            let content = 'Duration: ' + song.duration.duration;
            content += `  ${song.url}`;

            let title = num + ' ' + `**${song.title}**`;
            embed.addField(title, content);
        });
    }

    const msg = await message.channel.send(embed);

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

        let title = `**Favorites**\nPage **${currentPage + 1} / ${pages.size}**`;
        title += `\nSongs **${user.favorites.length}**`;
        title += '\n\u200b';

        const newEmbed = new MessageEmbed()
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setTitle(title)
            .setColor(embedColor);

        const page = pages.get(currentPage);
        if (!page) return;

        page.map((song, index) => {
            const num = `**${currentPage * songsPerPage + (index + 1)}**`;
            let content = 'Duration: ' + song.duration.duration;
            content += `  ${song.url}`;

            let title = num + ' ' + `**${song.title}**`;
            newEmbed.addField(title, content);
        });

        msg.edit(newEmbed);
    });

    collector.on('end', collected => {
        msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE)
                logger.error(error)
        })
    })
}
