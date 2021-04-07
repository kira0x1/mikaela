import { Collection, MessageReaction, User } from 'discord.js';
import ms from 'ms';

import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { findOrCreateServer } from '../../database/api/serverApi';
import { createFooter, embedColor } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'LastPlayed',
    aliases: ['previous', 'played', 'lp'],
    description: 'Displays the last songs played in this server',

    async execute(message, args) {
        const server = await findOrCreateServer(message.guild)
        const songs = server.lastPlayed.reverse()

        const songsPerPage = 5

        const pages: Collection<number, ISong[]> = new Collection();

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
        const embed = createFooter(message)
            .setColor(embedColor)
            .setThumbnail(message.guild.bannerURL())


        let title = `**Songs Played**\nPage **${pageAt + 1} / ${pages.size}**`;
        title += `\nSongs **${songs.length}**`;
        title += '\n\u200b';

        embed.setTitle(title);

        const page = pages.get(pageAt);

        if (page) {
            page.map((song, index) => {
                const num = `**${index + 1}**  `;
                let content = `${song.url}\n<@${song.playedBy}>`
                let title = `${num} **${song.title}**`;

                embed.addField(title, content);
            });
        }

        const msg = await message.channel.send(embed);

        //If there are only 1 or none pages then dont add the next, previous page emojis / collector
        if (pages.size <= 1) return;

        msg.react('⬅').then(() => msg.react('➡'));

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

            let title = `**Songs Played**\nPage **${currentPage + 1} / ${pages.size}**`;
            title += `\nSongs **${songs.length}**`;
            title += '\n\u200b';

            const newEmbed = createFooter(message)
                .setThumbnail(message.guild.bannerURL())
                .setTitle(title)
                .setColor(embedColor);

            const page = pages.get(currentPage);
            if (!page) return;

            page.map((song, index) => {
                const num = `**${currentPage * songsPerPage + (index + 1)}**`;
                let content = `${song.url}\n<@${song.playedBy}>`
                let title = `${num} **${song.title}**`;
                newEmbed.addField(title, content);
            });

            msg.edit(newEmbed);
        });

        collector.on('end', collected => {
            msg.reactions.removeAll();
        })
    }
}