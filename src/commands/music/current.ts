import { ICommand } from '../../classes/Command';
import { getPlayer } from '../../app';
import { RichEmbed } from 'discord.js';
import { embedColor } from '../../util/style';
export const command: ICommand = {
    name: "CurrentSong",
    description: "Display the currently playing song",
    aliases: ['np', 'playing', 'current', 'c'],

    async execute(message, args) {
        //Get the guilds current player
        const player = getPlayer(message)
        if (player) {
            const currentSong = player.currentlyPlaying;

            //Create embed
            const embed = new RichEmbed()
            embed.setColor(embedColor)

            const stream = player.getStream();

            if (stream && player.currentlyPlaying) {
                const streamTime = stream.time / 1000;

                const minutes = Math.floor(streamTime / 60)
                const seconds = streamTime - (minutes * 60)

                const duration = player.currentlyPlaying.duration

                let minutesLeft = Number(duration.minutes) * 60;
                minutesLeft -= stream.time / 1000
                // minutesLeft -= seconds
                minutesLeft /= 60


                let secondsLeft: string | number = minutesLeft * 60
                secondsLeft += Number(duration.seconds)
                secondsLeft -= seconds
                secondsLeft = secondsLeft % 60

                if (secondsLeft <= 9) {
                    secondsLeft = `0${secondsLeft.toFixed(0)}`
                } else {
                    secondsLeft = secondsLeft.toFixed(0)
                }

                secondsLeft = Math.abs(Number(secondsLeft))

                let hasPassedFirstMinute = false

                if (!hasPassedFirstMinute && secondsLeft > Number(duration.seconds)) {
                    hasPassedFirstMinute = true;
                    minutesLeft--
                }


                if (currentSong) {
                    embed.setTitle("Playing: " + currentSong.title)
                    embed.setURL(currentSong.url)
                    embed.setDescription(`Duration: ${duration.duration}`);
                    embed.addField(`Time left`, `${minutesLeft.toFixed(0)}:${secondsLeft}`)
                } else {
                    embed.setTitle("No song currently playing")
                }

                message.channel.send(embed)
            }
        }
    }
}