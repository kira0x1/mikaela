import { randomUUID } from 'crypto';
import { MessageActionRow, MessageButton } from 'discord.js';
import { Command } from '../../classes/Command';
import { quickEmbed } from '../../util';
import { createCurrentlyPlayingEmbed, createFavoriteCollector, getPlayer } from '../../util/musicUtil';

export const command: Command = {
   name: 'Now Playing',
   description: 'Display the currently playing song',
   aliases: ['np', 'playing', 'current', 'c', 'nowplaying', 'currentsong'],

   async execute(message, args) {
      // Get the guilds current player
      const player = getPlayer(message.guildId);
      if (!player) return;

      const currentSong = player.currentlyPlaying;

      if (!player.currentlyPlaying) {
         return quickEmbed(message, 'No song currently playing');
      }

      // Create embed
      const embed = await createCurrentlyPlayingEmbed(player, message);

      const btnId = randomUUID();
      const row = new MessageActionRow().addComponents(
         new MessageButton().setCustomId(btnId).setLabel('Add To Favorites').setStyle('PRIMARY')
      );

      const msg = await message.channel.send({ embeds: [embed], components: [row] });
      await createFavoriteCollector(currentSong, msg, btnId);
   }
};
