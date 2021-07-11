import { Message } from 'discord.js';
import { Command } from '../../classes/Command';
import { setBannedChannel, bannedChannels } from '../../database/api/serverApi';
import { sendErrorEmbed, wrap, createFooter, successIconUrl } from '../../util/styleUtil';

export const command: Command = {
   name: 'BlockChannel',
   description: 'Block the bot from being used in a channel by giving its id',
   aliases: ['BanChannel', 'bchannel', 'blockedchannel', 'blockedchannels', 'bannedchannels'],
   usage: '[channelId]',
   perms: ['admin', 'mod', 'kira'],
   async execute(message, args) {
      const channelId: string = args.shift();

      if (channelId === undefined) {
         listBlockedChannels(message);
         return;
      }

      const guild = message.guild;
      const channel = guild.channels.cache.get(channelId);

      if (!channel) {
         return sendErrorEmbed(message, `Could not find a channel that has the id ${wrap(channelId)}`);
      }

      const savedChannel = await setBannedChannel(message, channel);
      if (!savedChannel) {
         return sendErrorEmbed(message, `Channel is already banned`);
      }

      const embed = createFooter(message)
         .setThumbnail(successIconUrl)
         .setTitle(`Banned Channel: ${channel.name}`);

      message.channel.send(embed);
   }
};

async function listBlockedChannels(message: Message) {
   const blockedChannels = bannedChannels.get(message.guild.id);

   const embed = createFooter(message)
      .setTitle('Blocked Channels')
      .setDescription(`${blockedChannels?.length || 0} channels currently blocked`);

   blockedChannels?.forEach(channel => embed.addField(channel.name, `Blocked by: <@${channel.bannedBy}>`));

   message.channel.send(embed);
}
