import { Channel, Client, GuildChannel, MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { createFooter, sendErrorEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'channelinfo',
   description: 'Shows info of a channel',
   aliases: ['channel'],

   async execute(message, args) {
      let channel: Channel = fetchChannel(message.client, args[0]);
      if (channel === undefined) return sendErrorEmbed(message, `Could not find channel \`${args[0]}\``);

      let embed: MessageEmbed = createFooter(message);

      embed.setTitle('Channel info');
      embed.setDescription(`Channel info for ${channel}`);

      embed.addField('Channel ID', `\`${channel.id}\``);
      embed.addField('Created at', channel.createdAt.toUTCString());

      // embed.addField('Position', channel.position, true);

      if (channel instanceof GuildChannel) {
         embed.addField('Members', channel.members.size.toString(), true);
      }

      await message.channel.send({ embeds: [embed] });
   }
};

function fetchChannel(client: Client, arg: string): Channel {
   // Remove mention
   arg = arg.replace(/<#|>/g, '');
   return client.channels.cache.get(arg);
}
