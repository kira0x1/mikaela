import { MessageEmbed } from 'discord.js';
import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'servericon',
    description: 'Shows the icon of the current server',
    aliases: ['icon', 'guildicon', 'srvicon'],

    execute(message, args) {
        const guild = message.guild;
        let embed: MessageEmbed = createFooter(message)
            .setTitle('Server icon')
            .setDescription(`Server icon for ${guild}`)
            .setImage(guild.iconURL({ dynamic: true }));

        message.channel.send(embed);
    },
};
