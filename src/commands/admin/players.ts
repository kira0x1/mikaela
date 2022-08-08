import { randomUUID } from 'crypto';
import {
   ButtonInteraction,
   CacheType,
   Collection,
   Message,
   MessageActionRow,
   MessageButton
} from 'discord.js';
import ms from 'ms';
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
         const queueLength = player.queue.songs.length;
         const vc = player.guild.me.voice.channel;
         const members = vc?.members;
         const membersCount = members ? members.size : 0;

         if (membersCount === 0) continue;
         playing.push(player);

         let totalDuration = 0;
         for (const song of player.getSongs()) {
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

      const notPlayingLength = players.filter(p => !p.isPlaying).size;
      const embed = createPlayerEmbed(message, playing, notPlayingLength, pages, 0);
      const msg = await message.channel.send({ embeds: [embed], components });

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

         const newEmbed = createPlayerEmbed(message, playing, notPlayingLength, pages, currentPage);
         await i.update({ embeds: [newEmbed] });
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
      .setDescription(`Playing: ${playing.length} / ${notPlayingLength}`);

   if (pages.size > 0) addCodeField(embed, pages.get(currentPage));
   return embed;
}
