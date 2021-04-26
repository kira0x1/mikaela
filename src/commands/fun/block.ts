import { Command } from '../../classes/Command';

const videoLink = "https://cdn.discordapp.com/attachments/702091543514710027/834224349417832489/video_2.mp4"

export const command: Command = {
    name: 'Blocked',
    description: 'Posts a video expressing your desire to block someone',
    aliases: ['block'],
    args: false,
    execute(message, args) {
        message.channel.send(videoLink)
    }
}