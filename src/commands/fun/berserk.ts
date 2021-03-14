import { ICommand } from '../../classes/Command';

const videoLink = "https://cdn.discordapp.com/attachments/702091543514710027/820641105951457290/readsberserkonce.mp4"

export const command: ICommand = {
    name: 'Berserk',
    description: 'Posts a video of dosha listening to some 😡 music',
    aliases: ['epic'],

    async execute(message, args) {
        message.channel.send(videoLink)
    }
}