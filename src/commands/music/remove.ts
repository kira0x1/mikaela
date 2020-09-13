import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../util/musicUtil';
import { ICommand } from '../../classes/Command';
import { embedColor, QuickEmbed } from '../../util/styleUtil';
import { getQueue, queueCalls } from './queue';

export const command: ICommand = {
    name: 'remove',
    description: 'Remove a song from queue',
    usage: '[position in queue]',
    aliases: ['r'],

    execute(message, args) {
        const player = getPlayer(message);
        if (!player) return;

        const arg1 = args.shift();
        if (!arg1) return;

        if (Number(arg1) === NaN) {
            QuickEmbed(message, 'Invalid position');
        } else {
            const pos = Number(arg1);

            if (pos > player.queue.songs.length + 1) {
                return QuickEmbed(message, 'Invalid position');
            } else {
                const song = player.queue.removeAt(pos - 1).shift();
                if (!song) return QuickEmbed(message, 'Couldnt find song');

                const embed = new MessageEmbed()
                    .setColor(embedColor)
                    .setTitle(`Removed song ${song.title}`)
                    .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }));

                message.channel.send(embed);

                const lastQueueCall = queueCalls.get(message.author.id);
                if (lastQueueCall) {
                    const queueEmbed = getQueue(message);
                    lastQueueCall.edit(queueEmbed);
                }
            }
        }
    },
};
