import { Collection, Constants, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { getPlaylists } from '../../database/api/playlistApi';
import { findOrCreate } from '../../database/api/userApi';
import { IPlaylist } from '../../database/models/Playlist';
import { getTarget } from '../../util/discordUtil';
import { createDeleteCollector } from '../../util/musicUtil';
import { embedColor, sendErrorEmbed } from '../../util/styleUtil';
import { getPages } from '../favorites/list';

export const command: Command = {
   name: 'list',
   description: 'list your playlists, or another users playlists',
   usage: '[empty | user], [Playlist Number]',
   isSubCommand: true,

   async execute(message, args) {
      try {
         const res = await findPlaylist(message, args);
         if (!res) return;

         if (!res.playlist) {
            ListUserPlaylists(message, res.target, res.playlists);
            return;
         }

         ListPlaylist(message, res.target, res.playlist);
      } catch (error: any) {
         sendErrorEmbed(message, error.message);
      }
   }
};

async function ListUserPlaylists(message: Message, target: User, playlists: IPlaylist[]) {
   const pages = getUserPlaylistsPages(playlists);
   const embed = createUserPlaylistsEmbed(target, playlists, pages);
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

   const collector = msg.createReactionCollector(filter, { time: ms('3h') });

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

      const newEmbed = createUserPlaylistsEmbed(target, playlists, pages, currentPage);
      msg.edit(newEmbed);
   });

   collector.on('end', collected => {
      msg.reactions.removeAll().catch(error => {
         if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
      });
   });
}

function getUserPlaylistsPages(playlists: IPlaylist[]) {
   const pages: Collection<number, IPlaylist[]> = new Collection();

   let count = 0;
   let pageAtInLoop = 0;
   pages.set(0, []);

   for (const playlist of playlists) {
      if (count >= 5) {
         count = 0;
         pageAtInLoop++;
         pages.set(pageAtInLoop, []);
      }

      const pagePlaylists = pages.get(pageAtInLoop);
      if (pagePlaylists) pagePlaylists.push(playlist);

      count++;
   }

   return pages;
}

function createUserPlaylistsEmbed(
   target: User,
   playlists: IPlaylist[],
   pages: Collection<number, IPlaylist[]>,
   pageAt = 0
) {
   let title = `**Playlists**\nPage **${pageAt + 1} / ${pages.size}**`;

   const embed = new MessageEmbed()
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(embedColor)
      .setTitle(title)
      .setDescription(`**playlists: ${playlists.length}**\n\u200b`);

   const page = pages.get(pageAt);
   if (!page) {
      logger.warn(`Could not get page: ${pageAt} for user ${target.username}`);
      return;
   }

   page.map((playlist, index) => {
      const num = `**${pageAt * 5 + (index + 1)}**`;
      let content = `Songs: ${playlist.songs.length}`;
      let title = `${num}: **${playlist.title}**`;

      embed.addField(title, content);
   });

   return embed;
}

async function ListPlaylist(message: Message, target: User, playlist: IPlaylist) {
   const pages = getPages(playlist.songs);

   const embed = createPlaylistEmbed(target, playlist, pages);

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

   const collector = msg.createReactionCollector(filter, { time: ms('3h') });

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

      const newEmbed = createPlaylistEmbed(target, playlist, pages, currentPage);

      msg.edit(newEmbed);
   });

   collector.on('end', collected => {
      msg.reactions.removeAll().catch(error => {
         if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
      });
   });
}

function createPlaylistEmbed(
   target: User,
   playlist: IPlaylist,
   pages: Collection<number, Song[]>,
   pageAt = 0
) {
   let title = `Playlist: **${playlist.title}**`;
   title += `\nSongs **${playlist.songs.length}**`;
   title += `\nPage **${pageAt + 1} / ${pages.size}**`;
   // title += '\n\u200b';

   const embed = new MessageEmbed()
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(embedColor)
      .setTitle(title);

   if (playlist.description && playlist.description !== '') {
      embed.setDescription(`\nDescription: ${playlist.description}`);
   }

   const page = pages.get(pageAt);
   if (!page) {
      logger.warn(`Could not get page: ${pageAt} for user ${target.username}`);
      return;
   }

   page.map((song, index) => {
      const num = `**${pageAt * 5 + (index + 1)}**`;
      let content = `Duration: ${song.duration.duration}  ${song.spotifyUrl ? song.spotifyUrl : song.url}`;
      let title = `${num} **${song.title}**`;

      embed.addField(title, content);
   });

   return embed;
}

export async function findPlaylist(message: Message, args: string[]) {
   let playlistIndex: number | undefined;

   for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (!Number(arg)) continue;

      playlistIndex = Number(arg);
      args.splice(i, 1);
      break;
   }

   // ? Get User
   let target = message.author;
   if (args.length > 0) target = await getTarget(message, args.join(' '));

   if (!target) throw new Error(`Could not find user \`${args.join(' ')}\``);

   const userResult = await findOrCreate(target);
   const playlists = await getPlaylists(userResult._id);

   if (playlists.length === 0) throw new Error(`${target} has no playlists`);

   if (playlistIndex === undefined) {
      return { target: target, playlists: playlists };
   }

   playlistIndex--;

   if (playlists.length < playlistIndex || !playlists[playlistIndex]) {
      throw new Error(`playlist at index \"${playlistIndex++}\" not found`);
   }

   return { target: target, playlist: playlists[playlistIndex] };
}
