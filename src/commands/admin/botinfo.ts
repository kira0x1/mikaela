import { randomUUID } from 'crypto';
import {
   ButtonInteraction,
   CacheType,
   Collection,
   Guild,
   Message,
   MessageActionRow,
   MessageButton
} from 'discord.js';
import moment from 'moment';
import ms from 'ms';
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

      const resetId = randomUUID();
      const nextId = randomUUID();
      const backId = randomUUID();

      const components = [];

      if (pages.size > 1) {
         const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId(resetId).setLabel('Reset').setStyle('PRIMARY'),
            new MessageButton().setCustomId(backId).setLabel('Back').setStyle('PRIMARY'),
            new MessageButton().setCustomId(nextId).setLabel('Next').setStyle('PRIMARY')
         );

         components.push(row);
      }

      const embed = createInfoEmbed(message, guilds, pages, 0);
      const msg = await message.channel.send({ embeds: [embed], components });

      // If there are only 1 or none pages then dont add the next, previous page emojis / collector
      if (pages.size <= 1) {
         return;
      }

      const filter = (i: ButtonInteraction<CacheType>) => {
         return i.customId === nextId || i.customId === backId || i.customId === resetId;
      };

      const collector = msg.channel.createMessageComponentCollector({
         filter,
         componentType: 'BUTTON',
         time: ms('3h')
      });

      let currentPage = 0;

      collector.on('collect', async i => {
         if (!i.isButton()) return;

         if (i.customId === nextId) {
            currentPage++;
            if (currentPage >= pages.size) currentPage = 0;
         } else if (i.customId === backId) {
            currentPage--;
            if (currentPage < 0) currentPage = pages.size - 1;
         } else if (i.customId === resetId) currentPage = 0;

         const newEmbed = createInfoEmbed(message, guilds, pages, currentPage);
         await i.update({ embeds: [newEmbed] });
      });
   }
};

function createInfoEmbed(
   message: Message,
   guilds: Collection<string, Guild>,
   pages: Collection<number, Guild[]>,
   pageAt = 0
) {
   const embed = createFooter(message).setTitle(
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
