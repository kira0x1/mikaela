import { ICommand } from '../../classes/Command';
import { createFooter, sendErrorEmbed } from '../../util/Style';
import { Guild, Message, MessageEmbed, Role } from 'discord.js';

export const command: ICommand = {
    name: 'roleinfo',
    description: 'Shows info about a role',
    aliases: ['role'],
    args: true,

    async execute(message, args) {
        let arg: string = args[0];
        let role: Role = await parseRole(arg, message.guild);

        if (!role) {
            await sendErrorEmbed(message, `Cannot find role ${role}`);
            return;
        }

        await sendEmbed(message, role);
    },
};

async function sendEmbed(message: Message, role: Role) {
    let embed: MessageEmbed = createFooter(message.client);

    embed.setTitle('Role info');
    embed.setDescription(`Role info for ${role}`);

    embed.setColor(role.color);

    embed.addField('Role ID', `\`${role.id}\``);

    let createdAt: string = role.createdAt.toUTCString();

    embed.addField('Created at', createdAt);
    embed.addField('Hoist', role.hoist, true);
    embed.addField('Mentionable', role.mentionable, true);
    embed.addField('Position', role.position, true);
    embed.addField('Members with role', role.members.size, true);

    let channel = message.channel;

    await channel.send(embed);
}

const ROLE_MENTION_PATTERN = /<@&|>/g;

async function parseRole(roleStr: string, guild: Guild): Promise<Role> {
    let parsedStr: string = roleStr.replace(ROLE_MENTION_PATTERN, '');

    return await guild.roles.fetch(parsedStr).catch(_ => {
        return null;
    });
}
