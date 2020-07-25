import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/Style';
import { MessageEmbed } from 'discord.js';

export const command: ICommand = {
    name: 'servericon',
    description: 'Shows the icon of the current server',
    aliases: ['icon', 'guildicon', 'srvicon'],

    execute(message, _) {
        let guild = message.guild;
        let embed: MessageEmbed = createFooter(message.client);

        embed.setTitle('Server icon');
        embed.setDescription(`Server icon for ${guild}`);

        embed.setImage(guild.iconURL({ size: 4096 }));

        message.channel.send(embed);
    },
};
