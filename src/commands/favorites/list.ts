import { randomUUID } from 'crypto';
import {
   ButtonInteraction,
   CacheType,
   Collection,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
   User
} from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { findOrCreate } from '../../database/api/userApi';
import { IUser } from '../../database/models/User';
import { getTarget } from '../../util/discordUtil';
import { createFooter, embedColor, quickEmbed } from '../../util/styleUtil';

const favlistCalls: Collection<string, Message> = new Collection();
const songsPerPage = 5;

export const command: Command = {
   name: 'list',
   description: 'Lists your favorites or someone elses',
   aliases: ['ls'],
   usage: '[empty | user]',
   isSubCommand: true,
   cooldown: 1,

   async execute(message, args) {
      let target = message.author;
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const user = await findOrCreate(target);

      if (!user || !user.favorites || user.favorites.length === 0) {
         const embed: MessageEmbed = createFooter(message)
            .setTitle(target.username + '\n\u200b')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription('Favorites: none')
            .setColor(embedColor);
         return message.channel.send({ embeds: [embed] });
      }

      ListFavorites(message, target, user);
   }
};

export async function updateFavList(userId: string) {
   const lastFav = favlistCalls.get(userId);
   if (!lastFav) return;
}

function createFavListEmbed(target: User, user: IUser, pages: Collection<number, Song[]>, pageAt = 0) {
   let title = `**Favorites**\nPage **${pageAt + 1} / ${pages.size}**`;
   title += `\nSongs **${user.favorites.length}**`;
   title += '\n\u200b';

   const embed = new MessageEmbed()
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(embedColor)
      .setTitle(title);

   const page = pages.get(pageAt);
   if (!page) {
      logger.warn(`Could not get page: ${pageAt} for user ${user.username}`);
      return;
   }

   page.map((song, index) => {
      const num = `**${pageAt * songsPerPage + (index + 1)}**`;
      let content = `Duration: ${song.duration.duration}  ${song.spotifyUrl ? song.spotifyUrl : song.url}`;
      let title = `${num} **${song.title}**`;

      embed.addField(title, content);
   });

   return embed;
}

export function getPages(songs: Song[]) {
   const pages: Collection<number, Song[]> = new Collection();

   let count = 0;
   let pageAtInLoop = 0;
   pages.set(0, []);

   for (const song of songs) {
      if (count >= songsPerPage) {
         count = 0;
         pageAtInLoop++;
         pages.set(pageAtInLoop, []);
      }

      const pageSongs = pages.get(pageAtInLoop);
      if (pageSongs) pageSongs.push(song);

      count++;
   }

   return pages;
}

async function ListFavorites(message: Message, target: User, user: IUser) {
   const songs = user.favorites;
   const pages = getPages(songs.reverse());

   const embed = createFavListEmbed(target, user, pages);

   const nextId = randomUUID();
   const backId = randomUUID();

   const components = [];

   if (pages.size > 1) {
      const row = new MessageActionRow().addComponents(
         new MessageButton().setCustomId(backId).setLabel('Back').setStyle('PRIMARY'),
         new MessageButton().setCustomId(nextId).setLabel('Next').setStyle('PRIMARY')
      );
      components.push(row);
   }

   const msg = await message.channel.send({ embeds: [embed], components });
   favlistCalls.set(message.author.id, msg);

   // If there are only 1 or none pages then dont add the next, previous page emojis / collector
   if (pages.size <= 1) {
      return;
   }

   const filter = (i: ButtonInteraction<CacheType>) => {
      return i.customId === nextId || i.customId === backId;
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
      }

      const newEmbed = createFavListEmbed(target, user, pages, currentPage);
      await i.update({ embeds: [newEmbed] });
   });
}
