import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'shuffle queue',
    description: 'shuffle the queue',
    aliases: ['sq', 'shuffleq', 'shufflequeue'],

    async execute(message, args) {
        const player = getPlayer(message);
        if (!player) return console.error(`Could not find player for guild ${message.guild.name}`);

        if (!player.queue.songs || player.queue.songs.length === 0) {
            const embed = new MessageEmbed().setTitle(`No songs currently playing to shuffle`);

            message.channel.send(embed);
            return;
        }

        player.queue.shuffle();

        const embed = new MessageEmbed();
        embed.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }));
        embed.setTitle(`Shuffled Queue!`);

        player.queue.songs.map((song, index) => {
            embed.addField(`${index + 1} ${song.title}`, song.url);
        });

        message.channel.send(embed);
    },
};
