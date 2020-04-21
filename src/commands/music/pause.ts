import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { embedColor, QuickEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'Pause',
    description: 'Pause the currently playing song',
    aliases: ['ps'],

    async execute(message, args) {
        const player = getPlayer(message);
        if (player) {
            if (player.currentlyPlaying === undefined) {
                QuickEmbed(message, `No song currently playing to pause`);
                return;
            }

            if (player.pause()) {
                const embed = new MessageEmbed();
                embed.setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }));
                embed.setTitle(`Paused ${player.currentlyPlaying.title}`);
                embed.setColor(embedColor);

                message.channel.send(embed);
            }
        }
    },
};
