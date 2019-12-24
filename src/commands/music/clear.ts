import { ICommand } from "../../classes/Command";
import { getPlayer } from '../../app';
import { RichEmbed } from 'discord.js';
import { embedColor } from "../../util/style";

export const command: ICommand = {
    name: "clear",
    description: "Clears the queue",

    async execute(message, args) {
        const player = getPlayer(message)
        if (!player) return console.log(`player not found for guild ${message.guild.name}`)

        player.clearQueue()
        const embed = new RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
        embed.setColor(embedColor)
        embed.setTitle(`Queue cleared by ${message.author.username}`)

        message.channel.send(embed)
    }
}