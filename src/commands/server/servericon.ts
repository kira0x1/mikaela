import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/Style';
import { MessageEmbed } from 'discord.js';

export const command: ICommand = {
    name: 'servericon',
    description: 'Shows the icon of the current server',
    aliases: ['icon', 'guildicon', 'srvicon'],

    execute(message, args) {
        const guild = message.guild;
        let embed: MessageEmbed = createFooter(message.client)
            .setTitle('Server icon')
            .setDescription(`Server icon for ${guild}`)
            .setImage(guild.iconURL({ dynamic: true }));

        message.channel.send(embed);
    },
};
