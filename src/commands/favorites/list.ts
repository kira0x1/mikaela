import { Collection, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { IUser } from '../../db/dbUser';
import { getUser } from '../../db/userController';
import { getTarget } from '../../util/musicUtil';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'list',
    description: 'Lists your favorites or someone elses',
    aliases: ['ls'],
    usage: '[empty | user]',
    isSubCommand: true,
    cooldown: 1,

    async execute(message, args) {
        let target = await getTarget(message, args.join(' '));

        if (!target) {
            if (args.length) return QuickEmbed(message, `Could not find user: \`${args.join(' ')}\``);
            target = message.author;
        }

        const user = await getUser(target.id);

        if (!user || !user.favorites || user.favorites.length === 0) {
            const embed: MessageEmbed = createFooter(message)
                .setTitle(target.username + '\n\u200b')
                .setThumbnail(target.avatarURL({ dynamic: true }))
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
    const embed = new MessageEmbed().setColor(embedColor).setThumbnail(target.avatarURL({ dynamic: true }));

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
    if (pages.size <= 1) return;

    msg.react('⬅').then(() => msg.react('➡'));

    const filter = (reaction: MessageReaction, userReacted: User) => {
        return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !userReacted.bot;
    };

    const collector = msg.createReactionCollector(filter);

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
            .setThumbnail(target.avatarURL({ dynamic: true }))
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
}
