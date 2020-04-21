import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { embedColor, QuickEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'Resume',
    description: 'Pause the currently playing song',
    aliases: ['unpause', 'continue'],

    async execute(message, args) {
        const player = getPlayer(message);
        if (player) {
            if (player.currentlyPlaying === undefined) {
                QuickEmbed(message, `No song currently playing to resume`);
                return;
            }

            if (player.isPaused) {
                player.unpause();

                const embed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
                    .setTitle(`Resuming ${player.currentlyPlaying.title}`)
                    .setColor(embedColor);

                message.channel.send(embed);
            } else {
                QuickEmbed(message, `Player isnt paused`);
            }
        }
    },
};
