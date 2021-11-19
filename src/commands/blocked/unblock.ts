import { Command } from '../../classes/Command';
import { blockedUsers, UnBlock } from '../../database/models/Blocked';
import { getTarget } from '../../util/discordUtil';
import { quickEmbed, createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'unblock',
   description: 'unblock a user so they can use mikaela again',
   perms: ['mod', 'kira'],
   args: true,

   async execute(message, args) {
      const query = args.join(' ');
      const target = await getTarget(message, query);
      if (!target && !blockedUsers.has(query)) return quickEmbed(message, `Member \"${query}\" not found`);

      const id = target?.id || query;

      if (!blockedUsers.has(id))
         return quickEmbed(message, `Member \"${target?.tag || `<@${id}>`}\" is not blocked`);

      UnBlock(id);
      const embed = createFooter(message.author).addField(`Unblocked`, `<@${id}>`);
      message.channel.send({ embeds: [embed] });
   }
};
