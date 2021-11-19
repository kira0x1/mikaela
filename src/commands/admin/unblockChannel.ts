import { Command } from '../../classes/Command';
import { createFooter, sendErrorEmbed, successIconUrl, wrap } from '../../util/styleUtil';
import { bannedChannels, unbanChannel } from '../../database/api/serverApi';
import { ThreadChannel } from 'discord.js';
export const command: Command = {
   name: 'unblockChannel',
   description: 'Unblock a channel',
   usage: '[channel id]',
   args: true,
   perms: ['admin', 'kira', 'mod'],
   aliases: ['unbanChannel', 'ubc'],
   execute(message, args) {
      const channelId: string = args.shift();

      const guild = message.guild;
      const channel = guild.channels.cache.get(channelId);

      if (!channel) {
         return sendErrorEmbed(message, `Could not find a channel that has the id ${wrap(channelId)}`);
      }

      if (channel instanceof ThreadChannel) {
         return sendErrorEmbed(message, `Thread's are not supported`);
      }

      const channels = bannedChannels.get(guild.id);
      if (!channels || !channels.find(c => c.id === channelId)) {
         return sendErrorEmbed(message, `Channel ${wrap(channel.name)} is not banned`);
      }

      unbanChannel(message, channel);

      const embed = createFooter(message.author)
         .setThumbnail(successIconUrl)
         .setTitle(`UnBlocked Channel: ${channel.name}`);

      message.channel.send({ embeds: [embed] });
   }
};
