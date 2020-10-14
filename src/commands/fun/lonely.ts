import { ICommand } from '../../classes/Command';

const koroneLink = 'https://cdn.discordapp.com/attachments/265256381437706240/758941396991213588/looneeely.mp4'

export const command: ICommand = {
    name: 'lonely',
    description: 'Posts a video of Korone telling you how lonely you are 😢',
    aliases: ['alone', 'korone'],

    execute(message, args: string[]) {
        message.channel.send(koroneLink);
    },
};
