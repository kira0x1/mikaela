import { Command } from '../../classes/Command';

const videoUrl = 'https://cdn.discordapp.com/attachments/642037173729624104/777496871001784350/TRUEoooooo.mp4'

export const command: Command = {
    name: 'True',
    aliases: ['truee', 'real', 'circlejerk'],
    description: 'Trrrueeeeeeeeeeee!!',

    execute(message, args) {
        message.channel.send(videoUrl);
    },
};
