import { MessageEmbed } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../util/musicUtil';
import { embedColor } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'Move',
    description: 'Move a commands position in the Queue',
    args: true,
    usage: '[song position] [desired position]',

    execute(message, args) {
        console.log(args)

        const player = getPlayer(message)
        if (player.getQueueCount() === 0) return message.channel.send('Queue is empty')

        if (args.length < 2) return message.channel.send('Not enough arguments..')

        let songPos: string | number = args.shift();
        let toPos: string | number = args.shift();

        songPos = Number(songPos)
        toPos = Number(toPos)

        songPos--;
        toPos--;

        const songSelected = player.queue.songs[songPos]
        const otherSong = player.queue.songs[toPos]

        if (!songSelected || !otherSong)
            return message.channel.send('One of the songs selected is undefined')

        player.queue.songs[toPos] = songSelected
        player.queue.songs[songPos] = otherSong

        const embed = new MessageEmbed().setColor(embedColor)
            .setTitle(`Moved song from ${songPos + 1} to ${toPos + 1}`)
            .setAuthor(message.author.username, message.author.avatarURL())

        message.channel.send(embed)
    }
}