import { Collection, Constants, Message, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../system';
import { Command } from '../../classes/Command';
import { Player } from '../../classes/Player';
import { addCodeField, createFooter, players } from '../../util';

export const command: Command = {
   name: 'Players',
   description: 'List all players',
   aliases: ['streams'],
   perms: ['kira'],

   async execute(message, args) {
      const pages: Collection<number, string> = new Collection();
      const playing: Player[] = [];

      let i = 0;
      for (const { '1': player } of players) {
         if (!player.isPlaying) continue;
         playing.push(player);
         const queueLength = player.queue.songs.length;
         const vc = player.guild.me.voice.channel;

         const members = vc?.members;
         let membersCount = 0;

         if (members) {
            membersCount = members.size;
         }

         let totalDuration = 0;
         for (const song of player.getSongs()) {
            console.dir(song.duration);
            let adding = song.duration.totalSeconds;
            if (!adding) {
               adding = Number(song.duration.hours) * 3600;
               adding += Number(song.duration.minutes) * 60;
               adding += Number(song.duration.seconds);
            }
            totalDuration += adding;
         }

         totalDuration *= 1000;

         if (!totalDuration || isNaN(totalDuration)) totalDuration = 0;

         let field = `server: ${player.guild?.name}\n`;
         field += `channel: ${vc?.name}\n`;
         field += `members: ${membersCount}\n`;
         field += `queue: ${queueLength}\n`;
         field += `current: ${player.currentlyPlaying?.title}\n`;
         field += `duration: ${player.getDurationPretty()}\n`;
         field += `total queue duration: ${ms(totalDuration, { long: true })}\n`;
         field += `-----------------------------`;
         pages.set(i, field);
         i++;
      }

      const notPlayingLength = players.filter(p => !p.isPlaying).size;
      const embed = createPlayerEmbed(message, playing, notPlayingLength, pages, 0);
      const msg = await message.channel.send({ embeds: [embed] });

      // If there are only 1 or none pages then dont add the next, previous page emojis / collector
      if (pages.size <= 1) {
         return;
      }

      msg.react('⬅').then(() => msg.react('➡'));

      const filter = (reaction: MessageReaction, userReacted: User) => {
         return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !userReacted.bot;
      };

      const collector = msg.createReactionCollector({ filter, time: ms('1h') });

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

         const newEmbed = createPlayerEmbed(message, playing, notPlayingLength, pages, currentPage);
         msg.edit({ embeds: [newEmbed] });
      });

      collector.on('end', collected => {
         msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
         });
      });
   }
};

function createPlayerEmbed(
   message: Message,
   playing: Player[],
   notPlayingLength: number,
   pages: Collection<number, string>,
   currentPage: number
) {
   const embed = createFooter(message.author)
      .setTitle(
         `Players: ${players.size}\n**Page ${currentPage + 1} / ${pages.size === 0 ? 1 : pages.size}**`
      )
      .setDescription(`Playing: ${playing.length}\nNot Playing: ${notPlayingLength}`);

   if (pages.size > 0) addCodeField(embed, pages.get(currentPage));
   return embed;
}
