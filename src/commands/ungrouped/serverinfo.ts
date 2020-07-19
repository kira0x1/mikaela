import { ICommand } from '../../classes/Command';
import { createFooter } from '../../util/Style';
import { MessageEmbed } from 'discord.js';

export const command: ICommand = {
    name: 'serverinfo',
    description: 'Shows info of the current server',
    aliases: ['srvinfo', 'server', 'guild'],

    execute(message, _) {
        let guild = message.guild;
        let embed: MessageEmbed = createFooter(message.client);

        embed.setTitle('Server info');

        let description: string = guild.description || `Server info for ${message.guild}`;
        embed.setDescription(description);


        embed.setThumbnail(guild.iconURL({ size: 1024 }));

        embed.addField('Server ID', `\`${guild.id}\``);
        embed.addField('Member count', guild.memberCount);
        embed.addField('Created at', guild.createdAt.toUTCString());
        embed.addField('Owner', guild.owner, true);
        embed.addField('Region', guild.region, true);

        message.channel.send(embed);
    },
};
