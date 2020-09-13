import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'NotPoggers',
    aliases: ['npog', 'notpoggie', 'notpoggies', 'notpog'],
    description: 'Post not poggers video uwu',

    async execute(message, args) {
        message.channel.send(
            'https://cdn.discordapp.com/attachments/709803931878031404/752487923353649202/Senko_not_poggers.mp4'
        );
    },
};
