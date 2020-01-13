import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
import { QuickEmbed, embedColor } from '../../util/style';
import { RichEmbed } from 'discord.js';
import { queueCalls, getQueue } from './queue';
import chalk from 'chalk';

export const command: ICommand = {
    name: "remove",
    description: "Remove a song from queue",
    usage: "[position in queue]",
    aliases: ["r"],

    execute(message, args) {
        const player = getPlayer(message)
        if (!player) return

        const arg1 = args.shift()
        if (!arg1) return

        if (Number(arg1) === NaN) {
            QuickEmbed(message, "Invalid position")
        } else {
            const pos = Number(arg1)

            if (pos > player.queue.songs.length + 1) {
                return QuickEmbed(message, "Invalid position")
            } else {
                const song = player.queue.removeAt(pos - 1).shift()
                if (!song) return QuickEmbed(message, "Couldnt find song")

                const embed = new RichEmbed()
                    .setColor(embedColor)
                    .setTitle(`Removed song ${song.title}`)
                    .setAuthor(message.author.username, message.author.avatarURL)

                message.channel.send(embed)


                const lastQueueCall = queueCalls.get(message.author.id)
                if (lastQueueCall) {
                    const queueEmbed = getQueue(message)
                    lastQueueCall.edit(queueEmbed);
                }
            }
        }
    }
}