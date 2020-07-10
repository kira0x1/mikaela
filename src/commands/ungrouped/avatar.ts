import { ICommand } from '../../classes/Command';
import { MessageEmbed } from 'discord.js';

export const command: ICommand = {
    name: 'avatar',
    description: 'Lists all commands',
    aliases: ['av'],

    execute(message, _) {
        if (message.mentions.users.size > 1) {
            console.log("too many mentions");
        }

        let user = null;

        if (message.mentions.users.size == 0) {
            user = message.author;
        } else {
            user = message.mentions.users.first();
        }

        const embed = new MessageEmbed();

        embed.setTitle('Avatar');
        embed.setDescription(`Avatar of ${user}`);

        embed.setImage(user.avatarURL({'size': 4096}))

        message.channel.send(embed);
    },
};
