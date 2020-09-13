import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'Borgor',
    aliases: ['burger', 'borgar', 'burgers', 'burgerking'],
    description: 'Posts a video made by Jessica singing about burger king ❤',

    async execute(message, args) {
        message.channel.send('https://www.youtube.com/watch?v=0PAbtNGD-Gs');
    },
};
