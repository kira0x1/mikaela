import { ICommand } from '../../classes/Command';
import { Message, User } from 'discord.js';
import { parseUser } from '../../util/parser';
import { createFooter, sendErrorEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'userinfo',
    description: 'Shows information of a user',
    aliases: ['av'],

    async execute(message, args) {
        let user: User = null;

        if (args.length == 0) {
            user = message.author;
        } else {
            user = await parseUser(args[0], message.client);

            if (!user) {
                return await sendErrorEmbed(message, `Cannot find user ${args[0]}`);
            }
        }

        await sendEmbed(message, user);
    },
};

async function sendEmbed(message: Message, user: User) {
    const embed = createFooter(message.client);

    embed.setTitle('User info');
    embed.setDescription(`User info for ${user}`);

    embed.setThumbnail(user.avatarURL());

    embed.addField('User ID', `\`${user.id}\``);
    embed.addField('Created at', user.createdAt.toUTCString());

    let member = message.guild.member(user);

    if (member) {
        embed.addField('Joined at', member.joinedAt.toUTCString());
    }

    await message.channel.send(embed);
}
