import { ICommand } from '../../classes/Command';

const videoUrl = 'https://www.youtube.com/watch?v=0PAbtNGD-Gs'

export const command: ICommand = {
    name: 'Borgor',
    aliases: ['burger', 'borgar', 'burgers', 'burgerking', 'jess', 'jessica'],
    description: 'Posts a video made by Jessica singing about burger king ❤',

    execute(message, args) {
        message.channel.send(videoUrl);
    },
};
