import { ICommand } from '../../classes/Command';
import { User } from 'discord.js';
import { parseUser } from '../../util/parser';
import { simpleEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'userinfo',
    description: 'Shows information of a user',
    aliases: ['av'],

    async execute(message, args) {
        let user: User = await parseUser(args[0]) || message.author;

        const embed = simpleEmbed();

        embed.setTitle('User info');
        embed.setDescription(`User info for ${user}`);

        embed.setThumbnail(user.avatarURL());

        embed.addField('User ID', `\`${user.id}\``);
        embed.addField('Created at', user.createdAt.toUTCString());

        let member = message.guild.member(user);

        if (message.guild.member(user)) {
            embed.addField('Joined at', member.joinedAt.toUTCString());
        }

        await message.channel.send(embed);
    }
};
