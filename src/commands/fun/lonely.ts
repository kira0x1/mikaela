import { ICommand } from '../../classes/Command';

const koroneLink = 'https://cdn.discordapp.com/attachments/702091543514710027/820638857396617226/Korone_you_are_lonely_lonely_lonely.mp4'

export const command: ICommand = {
    name: 'lonely',
    description: 'Posts a video of Korone telling you how lonely you are 😢',
    aliases: ['alone', 'korone'],

    execute(message, args: string[]) {
        message.channel.send(koroneLink);
    },
};
