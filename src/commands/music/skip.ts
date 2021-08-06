import { MessageEmbed } from 'discord.js';

import { createDeleteCollector, getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';
import { embedColor, quickEmbed } from '../../util/styleUtil';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'Skip',
   description: 'Skip song',
   aliases: ['fs', 'next'],

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message);
      if (!player) return;

      // Get the current playing song
      const currentSong = player.currentlyPlaying;
      if (!currentSong) return quickEmbed(message, `No song currently playing`);

      // Create an embed with the information of the song to be skipped
      const embed = new MessageEmbed()
         .setColor(embedColor)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Skipped Song: ${currentSong.title}`)
         .setDescription(currentSong.url);

      player.skipSong();
      const msg = message.channel.send({ embeds: [embed] });
      createDeleteCollector(msg, message);
      updateLastQueue(message);
   }
};
