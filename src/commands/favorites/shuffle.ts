import { Collection, Constants, Message, MessageReaction, User, MessageEmbed } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { findOrCreate } from '../../database/api/userApi';
import { IUser } from '../../database/models/User';
import { getTarget } from '../../util/discordUtil';
import { createDeleteCollector, getPlayer, randomUniqueArray } from '../../util/musicUtil';
import { quickEmbed, sendErrorEmbed, embedColor } from '../../util/styleUtil';
import { getPages } from './list';

const maxShuffleAmount = 20;

export const command: Command = {
   name: 'shuffle',
   description: 'Shuffle songs from a favorites list',
   usage: '[amount: optional] [target: optional]',
   aliases: ['random', 'mix', 'rand', 'sh'],
   cooldown: 1,

   async execute(message, args) {
      let amount = 1;

      args.find((arg, pos) => {
         if (Number(arg)) {
            amount = Number(arg);
            args.splice(pos, 1);
         }
      });

      let target = message.author;
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const user = await findOrCreate(target);

      if (!user.favorites || user.favorites.length === 0) {
         return sendErrorEmbed(
            message,
            `Cannot shuffle from user <@${user.id}>\nuser must add songs to their favorites list first`,
            { errorTitle: 'User has no favorites' }
         );
      }

      const player = getPlayer(message);
      if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

      if (amount > maxShuffleAmount) {
         // embed.setFooter(`Max Amount is ${maxShuffleAmount}!`);
         amount = maxShuffleAmount;
      }

      const random = randomUniqueArray(user.favorites);
      const firstSong = random();

      const favSource = user.id;
      const playedBy = message.author.id;

      firstSong.favSource = favSource;
      firstSong.playedBy = playedBy;

      let startIndex = 1;

      player.addSong(firstSong, message);

      const songsAdding = [firstSong];

      for (let i = startIndex; i < amount; i++) {
         let song = random();

         if (songsAdding.includes(song) && songsAdding.length < user.favorites.length) {
            let hasFoundSong = false;
            while (!hasFoundSong) {
               song = random();
               if (!songsAdding.includes(song)) hasFoundSong = true;
            }
         }

         song.favSource = favSource;
         song.playedBy = playedBy;

         songsAdding.push(song);
         player.addSong(song, message, true);
      }

      createShuffleCollector(message, songsAdding, target, user, amount);
   }
};

async function createShuffleCollector(
   message: Message,
   songs: Song[],
   target: User,
   user: IUser,
   amount: number
) {
   const pages = getPages(songs);
   const embed = createShuffleEmbed(target, user, amount, pages, 0);
   const msg = await message.channel.send({ embeds: [embed] });

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

   const collector = msg.createReactionCollector({ filter, time: ms('3h') });

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

      const newEmbed = createShuffleEmbed(target, user, amount, pages, currentPage);
      msg.edit({ embeds: [newEmbed] });
   });

   collector.on('end', collected => {
      msg.reactions.removeAll().catch(error => {
         if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
      });
   });
}

function createShuffleEmbed(
   target: User,
   user: IUser,
   shuffleAmount: number,
   pages: Collection<number, Song[]>,
   pageAt: number
) {
   const embed = new MessageEmbed();
   let title = `Shuffling ${shuffleAmount} ${shuffleAmount > 1 ? 'songs' : 'song'} from ${user.username}`;
   if (pages.size > 1) title += `\nPage ${pageAt + 1} / ${pages.size}`;

   embed
      .setTitle(title)
      .setAuthor(target.username, target.displayAvatarURL({ dynamic: true }))
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(embedColor);

   let count = 1;
   const page = pages.get(pageAt);

   for (const song of page) {
      embed.addField(`${pageAt * 5 + count}. ${song.title}`, song.url);
      count++;
   }

   return embed;
}
