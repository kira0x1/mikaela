import { ICommand } from '../../classes/Command';
import { createDeleteCollector, getPlayer } from '../../util/musicUtil';
import { createFooter, embedColor, quickEmbed } from '../../util/styleUtil';
import { getQueue, queueCalls } from './queue';

export const command: ICommand = {
    name: 'remove',
    description: 'Remove a song from queue',
    usage: '[position in queue]',
    aliases: ['r'],

    async execute(message, args) {
        const player = getPlayer(message);
        if (!player) return;

        if (!player.hasSongs()) return quickEmbed(message, 'Queue is empty')

        const arg1 = args.shift();
        if (!arg1) return;

        if (Number(arg1) === NaN) {
            quickEmbed(message, 'Invalid position');
            return;
        }

        const pos = Number(arg1);

        if (pos > player.queue.songs.length + 1) {
            return quickEmbed(message, 'Invalid position');
        }

        const song = player.queue.removeAt(pos - 1).shift();
        if (!song) return quickEmbed(message, 'Couldnt find song');

        const embed = createFooter(message)
            .setColor(embedColor)
            .setTitle(`Removed song ${song.title}`)
            .setAuthor(
                message.author.username,
                message.author.displayAvatarURL({ dynamic: true })
            );

        message.channel.send(embed).then((msg) => createDeleteCollector(msg, message))

        const lastQueueCall = queueCalls.get(message.author.id);
        if (lastQueueCall) {
            const queueEmbed = await getQueue(message);
            lastQueueCall.edit(queueEmbed);
        }
    }
};
