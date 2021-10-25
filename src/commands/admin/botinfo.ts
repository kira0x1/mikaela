import { Command } from '../../classes/Command';
import { addCodeField, createFooter } from '../../util/styleUtil';
import { Collection, Constants, MessageReaction, User } from 'discord.js';
import { createDeleteCollector } from '../../util';
import ms from 'ms';
import { logger } from '../../app';

export const command: Command = {
   name: 'BotInfo',
   description: 'Display bot info and stats',
   perms: ['kira'],

   async execute(message, args) {
      const guilds = message.client.guilds.cache;

      const pageSize = 20;

      const pages: Collection<number, string[]> = new Collection();
      pages.set(0, []);
      let count = 0;
      let pageAt = 0;

      for (const { '1': guild } of guilds) {
         if (count >= pageSize) {
            count = 0;
            pageAt++;
            pages.set(pageAt, []);
         }

         const pageGuilds = pages.get(pageAt);
         if (pageGuilds) pageGuilds.push(guild.name);
         count++;
      }

      const embed = createFooter(message).setTitle(
         `Info\nServers: ${guilds.size}\n**Page 1 / ${pages.size}**`
      );

      addCodeField(embed, '---Servers---\n\n' + pages.get(0).join('\n'));

      const msg = await message.channel.send(embed);

      // If there are only 1 or none pages then dont add the next, previous page emojis / collector
      if (pages.size <= 1) {
         createDeleteCollector(msg, message);
         return;
      }

      msg.react('⬅')
         .then(() => msg.react('➡'))
         .finally(() => createDeleteCollector(msg, message));

      const filter = (reaction: MessageReaction, userReacted: User) => {
         return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !userReacted.bot;
      };

      const collector = msg.createReactionCollector(filter, { time: ms('1h') });

      let currentPage = 0;

      collector.on('collect', async (reaction: MessageReaction, userReacted: User) => {
         if (reaction.emoji.name === '➡') {
            currentPage++;
            if (currentPage >= pages.size) currentPage = 0;
         } else if (reaction.emoji.name === '⬅') {
            currentPage--;
            if (currentPage < 0) currentPage = pages.size - 1;
         }

         reaction.users.remove(userReacted);

         const newEmbed = createFooter(message).setTitle(
            `Info\nServers: ${guilds.size}\n**Page ${currentPage + 1} / ${pages.size}**`
         );

         addCodeField(newEmbed, '---Servers---\n\n' + pages.get(currentPage).join('\n'));
         msg.edit(newEmbed);
      });

      collector.on('end', collected => {
         msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
         });
      });
   }
};
