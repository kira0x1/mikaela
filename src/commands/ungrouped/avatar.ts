import { ICommand } from '../../classes/Command';
import { MessageEmbed, User } from 'discord.js';

export const command: ICommand = {
    name: 'avatar',
    description: 'Shows the avatar of a user',
    aliases: ['av'],

    execute(message, _) {
        if (message.mentions.users.size > 1) {
            throw "Too many mentions in command \'" + this.name +
            "\', expected 1, was " + message.mentions.users.size + '.';
        }

        let user: User = message.mentions.users.first() || message.author;

        const embed: MessageEmbed = new MessageEmbed();

        embed.setTitle('Avatar');
        embed.setDescription(`Avatar of ${user}`);


        embed.setImage(user.avatarURL({'size': 4096}))

        embed.setTimestamp(new Date());
        embed.setFooter('test');

        message.channel.send(embed);
    }
};
