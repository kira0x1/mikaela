import { ICommand } from '../../classes/Command';

const videoLink =
    'https://cdn.discordapp.com/attachments/702091543514710027/775342464152109096/degenerates.mp4';

export const command: ICommand = {
    name: 'degenerates',
    description: 'You guys are degenerates 😿',
    aliases: ['degen'],

    execute(message, args: string[]) {
        message.channel.send(videoLink);
    },
};
