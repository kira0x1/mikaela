import { Message, MessageEmbed, Role } from 'discord.js';

import { ICommand } from '../../classes/Command';
import { findRole } from '../../util/discordUtil';
import { createFooter, sendErrorEmbed } from '../../util/styleUtil';

export const command: ICommand = {
    name: 'roleinfo',
    description: 'Shows info about a role',
    aliases: ['role', 'roles'],
    args: true,

    async execute(message, args) {
        let query: string = args[0];
        let role: Role = findRole(message, query)

        if (!role) {
            await sendErrorEmbed(message, `Cannot find role ${query}`);
            return;
        }

        await sendEmbed(message, role);
    },
};

async function sendEmbed(message: Message, role: Role) {
    let embed: MessageEmbed = createFooter(message);

    embed.setTitle('Role info');
    embed.setDescription(`Role info for ${role}`);

    embed.setColor(role.color);

    addFields(embed, role);

    await message.channel.send(embed);
}

async function addFields(embed: MessageEmbed, role: Role) {
    embed.addField('Role ID', `\`${role.id}\``);
    embed.addField('Created at', role.createdAt.toUTCString());
    embed.addField('Hoist', role.hoist, true);
    embed.addField('Mentionable', role.mentionable, true);
    embed.addField('Position', role.position, true);
    embed.addField('Members with role', role.members.size, true);
}