import { randomUUID } from 'crypto';
import { MessageActionRow, MessageButton } from 'discord.js';
import ms from 'ms';
import { Command } from '../../classes/Command';
import { quickEmbed } from '../../util';
import { createCurrentlyPlayingEmbed, createFavoriteCollector, getPlayer } from '../../util/musicUtil';

const pauseIconUrl = `https://cdn.discordapp.com/attachments/702091543514710027/911609454145986651/pause-circle-regular-2.png`;

export const command: Command = {
   name: 'Now Playing',
   description: 'Display the currently playing song',
   aliases: ['np', 'playing', 'current', 'c', 'nowplaying', 'currentsong'],

   async execute(message, args) {
      // Get the guilds current player
      const player = getPlayer(message);
      if (!player) return;

      const currentSong = player.currentlyPlaying;

      if (!player.currentlyPlaying) {
         return quickEmbed(message, 'No song currently playing');
      }

      // Create embed
      const embed = await createCurrentlyPlayingEmbed(player, message);

      const addBtnId = randomUUID();

      const addBtnComponent = new MessageButton()
         .setCustomId(addBtnId)
         .setLabel('Add To Favorites')
         .setStyle('PRIMARY');

      const row = new MessageActionRow().addComponents(addBtnComponent);

      const resumeBtnId = randomUUID();

      if (player.isPaused()) {
         row.addComponents(
            new MessageButton().setCustomId(resumeBtnId).setLabel('Resume').setStyle('PRIMARY')
         );

         embed.setThumbnail(pauseIconUrl);
         embed.setDescription('**⏸ PAUSED**');
      }

      const msg = await message.channel.send({ embeds: [embed], components: [row] });
      await createFavoriteCollector(currentSong, msg, addBtnId);

      if (player.isPaused()) {
         const collector = msg.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: ms('6h')
         });

         collector.on('collect', async i => {
            if (!i.isButton() || i.customId !== resumeBtnId) return;

            embed.setDescription('');
            embed.thumbnail = undefined;

            player.unpause();

            i.update({ embeds: [embed], components: [row.setComponents(addBtnComponent)] });
         });
      }
   }
};
