import { ICommand } from '../../classes/Command';
import { Channel, Client, GuildChannel, Message, MessageEmbed } from 'discord.js';
import { createErrorEmbed, createFooter, sendErrorEmbed } from '../../util/Style';
import { CommandError } from '../../classes/CommandError';

export const command: ICommand = {
    name: 'channelinfo',
    description: 'Shows info of a channel',
    aliases: ['channel'],

    async execute(message, args) {
        let channel;

        console.log("args: " + args.length);

        if (args.length == 0) {
            console.log("no args");

            channel = message.channel;
        } else {
            channel = await fetchChannel(message.client, args[0]);

            if (!channel) {
                await sendErrorEmbed(message,`Could not find channel \`${args[0]}\``);
            }
        }

        let embed: MessageEmbed = createFooter(message.client);

        embed.setTitle('Channel info');
        embed.setDescription(`Channel info for ${channel}`);

        embed.addField('Channel ID', `\`${channel.id}\``);
        embed.addField('Created at', channel.createdAt.toUTCString());

        if (channel instanceof GuildChannel) {
            embed.addField('Members', channel.members.size);
        }

        await message.channel.send(embed);
    },
};

async function fetchChannel(client: Client, arg: string): Promise<Channel | CommandError> {
    arg = arg.replace(/<#|>/g, '')

    console.log("arg: " + arg);

    return await client.channels.fetch(arg).catch(_ => {
        return null;
    });
}
