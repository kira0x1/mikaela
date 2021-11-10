import { logger } from '../../system';
import { Command } from '../../classes/Command';
import { AddBlocked, blockedUsers } from '../../database/models/Blocked';
import { getTarget } from '../../util/discordUtil';
import { createFooter, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'Block',
   description: 'Block user from using the bot',
   aliases: ['mb'],
   perms: ['mod', 'kira'],
   args: true,

   async execute(message, args) {
      const query = args.join(' ');
      const target = await getTarget(message, query);
      if (!target) return quickEmbed(message, `Member \"${query}\" not found`);

      if (blockedUsers.has(target.id))
         return quickEmbed(message, `Member \"${target.tag}\" is already blocked`);

      const blockedResponse = await AddBlocked(target.tag, target.id);
      logger.log('info', blockedResponse);

      if (!blockedResponse) {
         return message.author.send(`Error while blocking user: ${query}`);
      }

      const embed = createFooter(message).setTitle(`Blocked: \"${target.tag}\"`).setDescription(target.id);
      message.channel.send({ embeds: [embed] });
   }
};
