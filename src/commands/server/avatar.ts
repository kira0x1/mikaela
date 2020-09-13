import { Message, MessageEmbed, User } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { getTarget } from '../../util/musicUtil';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'avatar',
    description: 'Shows the avatar of a user',
    aliases: ['av'],

    async execute(message, args) {
        const target = await getTarget(message, args.join(' '));
        sendEmbed(message, target);
    },
};

function sendEmbed(message: Message, user: User) {
    const embed: MessageEmbed = createFooter(message.client)
        .setTitle('Avatar')
        .setDescription(`Avatar of ${user}`)
        .setImage(user.avatarURL({ size: 4096, dynamic: true }));

    message.channel.send(embed);
}
