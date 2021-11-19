import { Collection, Constants, Guild, Message, MessageReaction, User } from 'discord.js';
import moment from 'moment';
import ms from 'ms';
import { logger } from '../../system';
import { Command } from '../../classes/Command';
import { createFooter } from '../../util/styleUtil';

const pageSize = 5;

export const command: Command = {
   name: 'BotInfo',
   description: 'Display bot info and stats',
   perms: ['kira'],

   async execute(message, args) {
      const guilds = message.client.guilds.cache.sort((g1, g2) => g2.joinedTimestamp - g1.joinedTimestamp);

      const pages: Collection<number, Guild[]> = new Collection();
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
         if (pageGuilds) pageGuilds.push(guild);
         count++;
      }

      const embed = createInfoEmbed(message, guilds, pages, 0);
      const msg = await message.channel.send({ embeds: [embed] });

      // If there are only 1 or none pages then dont add the next, previous page emojis / collector
      if (pages.size <= 1) {
         return;
      }

      msg.react('⏮️')
         .then(() => msg.react('⬅'))
         .then(() => msg.react('➡'))
         .then(() => msg.react('⏭️'));

      const filterReactions = ['⏮️', '⏭️', '⬅', '➡'];
      const filter = (reaction: MessageReaction, userReacted: User) => {
         return filterReactions.includes(reaction.emoji.name) && !userReacted.bot;
      };

      const collector = msg.createReactionCollector({ filter, time: ms('1h') });

      let currentPage = 0;

      collector.on('collect', async (reaction: MessageReaction, userReacted: User) => {
         switch (reaction.emoji.name) {
            case '➡':
               currentPage++;
               if (currentPage >= pages.size) currentPage = 0;
               break;
            case '⬅':
               currentPage--;
               if (currentPage < 0) currentPage = pages.size - 1;
               break;
            case '⏮️':
               currentPage = 0;
               break;
            case '⏭️':
               currentPage = pages.size - 1;
               break;
         }

         reaction.users.remove(userReacted);

         const newEmbed = createInfoEmbed(message, guilds, pages, currentPage);
         msg.edit({ embeds: [newEmbed] });
      });

      collector.on('end', collected => {
         msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
         });
      });
   }
};

function createInfoEmbed(
   message: Message,
   guilds: Collection<string, Guild>,
   pages: Collection<number, Guild[]>,
   pageAt = 0
) {
   const embed = createFooter(message.author).setTitle(
      `Info\nServers: ${guilds.size}\n**Page ${pageAt + 1} / ${pages.size}**\n\u200b`
   );

   let count = pageAt * pageSize;
   for (const g of pages.get(pageAt)) {
      count++;
      const joinedAt = moment(g.joinedAt).format('MMM Do YYYY');
      embed.addField(`**[${count}]**\t\t${g.name}`, `Joined:    **${joinedAt}**\n\u200b`);
   }

   return embed;
}
