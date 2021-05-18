import { Command } from '../../classes/Command';

const audioClip = 'https://cdn.discordapp.com/attachments/642037173729624104/844063352074010655/essays.mp3'

export const command: Command = {
    name: 'Essays',
    description: 'Keep writting essays!',
    aliases: ['essay'],

    async execute(message, args) {
        message.channel.send(audioClip)
    }
}