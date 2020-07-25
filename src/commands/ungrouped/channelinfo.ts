import { ICommand } from '../../classes/Command';
import { Channel, Client, GuildChannel, MessageEmbed } from 'discord.js';
import { createFooter } from '../../util/Style';

export const command: ICommand = {
    name: 'channelinfo',
    description: 'Shows info of a channel',
    aliases: ['channel'],

    async execute(message, args) {
        let channel: Channel = fetchChannel(message.client, args[0]) || message.channel;

        let embed: MessageEmbed = createFooter(message.client);

        embed.setTitle('Channel info');
        embed.setDescription(`Channel info for ${message.channel}`);

        embed.addField('Channel ID', `\`${channel.id}\``);
        embed.addField('Created at', channel.createdAt.toUTCString());

        if (channel instanceof GuildChannel) {
            embed.addField('Members', channel.members.size);
        }

        await message.channel.send(embed);
    },
};

function fetchChannel(client: Client, arg: string): Channel {
    if (!arg) {
        return null;
    }

    client.channels.fetch(arg).then(a => {
        return a
    }).catch(e => {
        console.log(e);
    })

    return null;
}
