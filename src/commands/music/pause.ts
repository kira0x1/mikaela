import { MessageEmbed } from 'discord.js';

import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';
import { embedColor, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'Pause',
   description: 'Pause the currently playing song',
   aliases: ['ps'],
   hidden: true,

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message);

      // Make sure a player exists
      if (!player) return;

      // If theres no song playing or if the stream dispatcher is undefined exit out
      if (!player.currentlyPlaying || !player.getStream())
         return quickEmbed(message, `No song currently playing to pause`);

      // If the stream is already paused exit out
      if (player.stream.paused) return quickEmbed(message, `Player is already paused`);

      // Pause the player
      player.pause();

      const embed = new MessageEmbed();
      embed.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));
      embed.setTitle(`Paused ${player.currentlyPlaying.title}`);
      embed.setColor(embedColor);

      message.channel.send(embed);
   }
};
