import { ICommand } from '../../classes/Command';
import { parseRole } from '../../util/parser';
import { createFooter } from '../../util/Style';
import { MessageEmbed, Role } from 'discord.js';

export const command: ICommand = {
    name: 'roleinfo',
    description: 'Shows info about a role',
    aliases: ['role'],

    async execute(message, args) {
        let embed: MessageEmbed = createFooter(message.client);
        let role: Role = await parseRole(args[0], message.guild);

        embed.setTitle('Role info');
        embed.setDescription(`Role info for ${role}`);

        embed.setColor(role.color);

        embed.addField('Role ID', `\`${role.id}\``);
        embed.addField('Created at', role.createdAt.toUTCString());
        embed.addField('Hoist', role.hoist, true);
        embed.addField('Mentionable', role.mentionable, true);
        embed.addField('Position', role.position, true);
        embed.addField('Members with role', role.members.size, true);

        await message.channel.send(embed);
    },
};
