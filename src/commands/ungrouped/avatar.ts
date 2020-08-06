import { ICommand } from '../../classes/Command';
import { Message, MessageEmbed, User } from 'discord.js';
import { parseUser } from '../../util/parser';
import { createFooter, sendErrorEmbed } from '../../util/Style';

export const command: ICommand = {
    name: 'avatar',
    description: 'Shows the avatar of a user',
    aliases: ['av'],

    async execute(message, args) {
        let user: User = null;

        if (!args) {
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
    const embed: MessageEmbed = createFooter(message.client);

    embed.setTitle('Avatar');
    embed.setDescription(`Avatar of ${user}`);

    embed.setImage(user.avatarURL({ size: 4096 }));

    await message.channel.send(embed);
}
