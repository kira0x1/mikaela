import { logger } from '../../app';
import { ICommand } from '../../classes/Command';
import { findOrCreate } from '../../database/api/userApi';
import { getTarget } from '../../util/discordUtil';
import { getPlayer, randomUniqueArray } from '../../util/musicUtil';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';

const maxShuffleAmount = 20;

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

        let target = message.author
        if (args.length > 0) target = await getTarget(message, args.join(' '));

        if (!target) return QuickEmbed(message, `Could not find user \`${args.join(' ')}\``)

        const user = await findOrCreate(target);

        if (!user.favorites || user.favorites.length == 0) {
            return QuickEmbed(message, 'You have no favorites to shuffle');
        }

        const embed = createFooter(message);
        embed.setColor(embedColor);

        const player = getPlayer(message);
        if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

        if (amount > maxShuffleAmount) {
            embed.setFooter(`Max Amount is ${maxShuffleAmount}!`);
            amount = maxShuffleAmount;
        }

        const title = `Shuffling ${amount} ${amount > 1 ? 'songs' : 'song'} from ${user.username}`;

        const random = randomUniqueArray(user.favorites)
        const firstSong = random()
        player.addSong(firstSong, message);

        embed.setTitle(title);
        embed.addField(`1 ${firstSong.title}`, firstSong.url);
        embed.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));
        embed.setThumbnail(target.displayAvatarURL({ dynamic: true }));

        const songsAdding = [firstSong]

        for (let i = 1; i < amount; i++) {
            let song = random()

            // logger.info(chalk.bgMagenta.bold(`Songs Adding Length: ${songsAdding.length}\nfavorites length: ${user.favorites.length}`))

            if (songsAdding.includes(song) && songsAdding.length < user.favorites.length) {
                // logger.info(chalk.bgCyan.bold(`\n ${song.title}\nDuplicate song, picking another one\n`))

                let hasFoundSong = false
                while (!hasFoundSong) {
                    song = random()
                    if (!songsAdding.includes(song)) hasFoundSong = true
                }

                // logger.info((chalk.bgCyan.bold(`picked: ${song.title}\n`)))
            }

            songsAdding.push(song)

            embed.addField(`${i + 1} ${song.title}`, song.url);
            player.addSong(song, message)
        }

        message.channel.send(embed);
    },
};
