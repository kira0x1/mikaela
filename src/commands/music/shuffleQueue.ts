import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';
import { embedColor } from '../../util/styleUtil';
import { logger } from '../../app';

export const command: ICommand = {
    name: 'shuffle queue',
    description: 'shuffle the queue',
    aliases: ['sq', 'shuffleq', 'shufflequeue'],

    async execute(message, args) {
        const player = getPlayer(message);
        if (!player) return logger.log('error',`Could not find player for guild ${message.guild.name}`);

        if (!player.queue.songs || player.queue.songs.length === 0) {
            const embed = new MessageEmbed()
                .setTitle(`No songs currently playing to shuffle`)
                .setColor(embedColor);

            message.channel.send(embed);
            return;
        }

        player.queue.shuffle();

        const embed = new MessageEmbed()
           .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setTitle(`Shuffled Queue!`)
            .setColor(embedColor)

        player.queue.songs.map((song, index) => {
            embed.addField(`${index + 1} ${song.title}`, song.url);
        });

        message.channel.send(embed);
    },
};
