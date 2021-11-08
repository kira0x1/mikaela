import { Collection, Constants, Message, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { Player } from '../../classes/Player';
import { createDeleteCollector, players } from '../../util/musicUtil';
import { addCodeField, createFooter } from '../../util/styleUtil';

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

         let field = `server: ${player.guild.name}\nchannel: \n`;
         field += `queue: ${queueLength}\n`;
         field += `current: ${player.currentlyPlaying?.title}\n duration: ${player.getDurationPretty()}\n`;
         field += `-----------------------------\n\n`;
         pages.set(i, field);
         i++;
      }

      const notPlayingLength = players.filter(p => !p.isPlaying).size;
      const embed = createPlayerEmbed(message, playing, notPlayingLength, pages, 0);
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
   const embed = createFooter(message)
      .setTitle(
         `Players: ${players.size}\n**Page ${currentPage + 1} / ${pages.size === 0 ? 1 : pages.size}**`
      )
      .setDescription(`Playing: ${playing.length}\nNot Playing: ${notPlayingLength}`);

   if (pages.size > 0) addCodeField(embed, pages.get(currentPage));
   return embed;
}
