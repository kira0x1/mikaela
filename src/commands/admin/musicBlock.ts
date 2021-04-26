import { Message } from 'discord.js';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { AddBlocked, blockedUsers } from '../../database/models/Blocked';
import { createFooter, quickEmbed, wrap } from '../../util/styleUtil';
import { getTarget } from '../../util/discordUtil';

export const command: Command = {
   name: 'MusicBlock',
   description: 'Block user from using the bot',
   perms: ['mod'],
   args: true,

   async execute(message, args) {
      if (args[0] === '--list') {
         listBlocked(message);
         return;
      }

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

      const embed = createFooter(message)
         .setTitle(`Blocked: \"${target.tag}\"`)
         .setDescription(target.id);

      message.channel.send(embed);
   }
};

function listBlocked(message: Message) {
   const embed = createFooter(message);

   if (blockedUsers.size === 0) embed.setTitle('Blocked List Empty');
   else embed.setTitle(`Blocked: ${blockedUsers.size}`);

   // const blockedCount = blockedUsers.size;
   // embed.title = blockedCount ? 'Blocked List Empty' : `Blocked: ${blockedCount} Users`

   blockedUsers.map((name, id) => {
      embed.addField(name, wrap(id), true);
   });

   message.channel.send(embed);
}
