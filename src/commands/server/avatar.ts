import { Message, MessageEmbed, User } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { getTarget } from '../../util/musicUtil';
import { createFooter, QuickEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'avatar',
    description: 'Shows the avatar of a user',
    aliases: ['av'],

    async execute(message, args) {
        let target = message.author
        if (args.length > 0)
            target = await getTarget(message, args.join(' '));

        if (!target) return QuickEmbed(message, `Could not find user \`${args.join(' ')}\``)
        sendEmbed(message, target);
    },
};

function sendEmbed(message: Message, user: User) {
    const embed: MessageEmbed = createFooter(message)
        .setTitle('Avatar')
        .setDescription(`Avatar of ${user}`)
        .setImage(user.avatarURL({ size: 4096, dynamic: true }));

    message.channel.send(embed);
}
