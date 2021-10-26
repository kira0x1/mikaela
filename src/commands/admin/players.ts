import { Constants, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { createDeleteCollector, players } from '../../util/musicUtil';
import { addCodeField, createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'Players',
   description: 'List all players',
   aliases: ['streams'],
   perms: ['kira'],

   async execute(message, args) {
      const playing = players.filter(p => p.isPlaying).array();

      const pages: string[] = [];

      for (const player of playing) {
         const songDuration = player.currentlyPlaying?.duration.duration;

         let streamTime = player.getStreamTime();

         if (streamTime > 0) {
            streamTime *= 1000;
         }

         const songStreamTime = ms(streamTime, { long: true });

         const queueLength = player.queue.songs.length;

         let field = `server: ${player.guild.name}\nchannel: ${player.voiceChannel.name}\n`;
         field += `queue: ${queueLength}\n`;
         field += `current: ${player.currentlyPlaying?.title}\n duration: ${songStreamTime} / ${songDuration}\n`;
         field += `-----------------------------\n\n`;
         pages.push(field);
      }

      const notPlayingLength = players.filter(p => !p.isPlaying).size;

      const embed = createFooter(message).setTitle(
         `Players: ${players.size}\n**Page 1 / ${pages.length}**`
      );

      embed.setDescription(`Playing: ${playing.length}\nNot Playing: ${notPlayingLength}`);

      if (pages.length > 0) addCodeField(embed, pages[0]);

      const msg = await message.channel.send(embed);

      // If there are only 1 or none pages then dont add the next, previous page emojis / collector
      if (pages.length === 0) {
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
            if (currentPage >= pages.length) currentPage = 0;
         } else if (reaction.emoji.name === '⬅') {
            currentPage--;
            if (currentPage < 0) currentPage = pages.length - 1;
         }

         reaction.users.remove(userReacted);

         const newEmbed = createFooter(message).setTitle(
            `Players: ${players.size}\n**Page ${currentPage + 1} / ${pages.length}**`
         );

         newEmbed.setDescription(`Playing: ${playing.length}\nNot Playing: ${notPlayingLength}`);

         addCodeField(newEmbed, pages[currentPage]);
         msg.edit(newEmbed);
      });

      collector.on('end', collected => {
         msg.reactions.removeAll().catch(error => {
            if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
         });
      });
   }
};
