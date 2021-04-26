import { Command } from '../../classes/Command';

const notPogLink = 'https://cdn.discordapp.com/attachments/709803931878031404/752487923353649202/Senko_not_poggers.mp4'

export const command: Command = {
    name: 'NotPoggers',
    aliases: ['npog', 'notpoggie', 'notpoggies', 'notpog'],
    description: 'Post not poggers video uwu',

    execute(message, args) {
        message.channel.send(notPogLink);
    },
};
