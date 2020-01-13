import { RichEmbed } from 'discord.js';
import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import { embedColor } from '../../util/Style';

export const command: ICommand = {
    name: "Skip",
    description: "Skip song",
    aliases: ['fs', 'next'],

    execute(message, args) {
        //Get the guilds player
        const player = getPlayer(message)

        if (player) {

            //Get the current playing song
            const currentSong = player.currentlyPlaying;

            if (currentSong) {
                //Create an embed with the information of the song to be skipped
                const embed = new RichEmbed()
                embed.setColor(embedColor)
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setTitle(`Skipped Song: ${currentSong.title}`)
                    .setDescription(currentSong.url)

                message.channel.send(embed)
            }
            player.skipSong()
        }
    }
}