import { ICommand } from '../../classes/Command';

export const command: ICommand = {
    name: 'poggers',
    description: 'Posts a poggie woggie',
    aliases: ['poggie', 'pog', 'pogger'],

    async execute(message, args: string[]) {
        message.channel.send(
            'https://cdn.discordapp.com/attachments/709803931878031404/751941837673201684/Poggers.mp4'
        );
    },
};
