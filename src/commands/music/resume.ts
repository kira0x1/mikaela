import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
import { RichEmbed } from 'discord.js';
import { embedColor, QuickEmbed } from '../../util/style';

export const command: ICommand = {
    name: 'Resume',
    description: 'Pause the currently playing song',
    aliases: ['unpause', 'continue'],

    async execute(message, args) {
        const player = getPlayer(message)
        if (player) {
            if (player.currentlyPlaying === undefined) {
                QuickEmbed(message, `No song currently playing to resume`)
                return
            }

            if (player.isPaused) {
                player.unpause();

                const embed = new RichEmbed()
                embed.setAuthor(message.author.username, message.author.avatarURL)
                embed.setTitle(`Resuming ${player.currentlyPlaying.title}`)
                embed.setColor(embedColor)

                message.channel.send(embed)
            } else {
                QuickEmbed(message, `Player isnt paused`)
            }
        }
    }
}