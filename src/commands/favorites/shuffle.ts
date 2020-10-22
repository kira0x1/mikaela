import { ICommand } from '../../classes/Command';
import { getUser } from '../../db/userController';
import { getPlayer, getTarget } from '../../util/musicUtil';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'shuffle',
    description: 'Shuffle songs from a favorites list',
    usage: '[amount: optional] [target: optional]',
    aliases: ['random', 'mix'],
    cooldown: 1,

    async execute(message, args) {
        let amount = 1;

        args.find((arg, pos) => {
            if (Number(arg)) {
                amount = Number(arg);
                args.splice(pos, 1);
            }
        });

        let target = (await getTarget(message, args.join(' '))) || message.author;
        const user = await getUser(target.id);

        if (!user.favorites) {
            return QuickEmbed(message, 'You have no favorites to shuffle');
        }

        const embed = createFooter(message);
        embed.setColor(embedColor);

        const player = getPlayer(message);
        if (!player) return console.error(`Could not find player for guild ${message.guild.name}`);

        if (amount > 15) {
            embed.setFooter(`Max Amount is 15!`);
            amount = 15;
        }

        let title = `Shuffling ${amount} song from ${user.username}`;

        if (amount > 1) {
            title = `Shuffling ${amount} songs from ${user.username}`;
        }

        const firstSong = user.favorites[Math.floor(Math.random() * user.favorites.length)];
        player.addSong(firstSong, message);

        embed.setTitle(title);
        embed.setDescription(`Playing ${firstSong.title}\n${firstSong.url}\n\u200b`);
        embed.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }));
        embed.setThumbnail(target.avatarURL({ dynamic: true }));

        for (let i = 0; i < amount - 1; i++) {
            let rand = Math.floor(Math.random() * user.favorites.length);
            const song = user.favorites[rand];
            embed.addField(`${i + 1} ${song.title}`, song.url);
            player.queue.addSong(song);
        }

        message.channel.send(embed);
    },
};
