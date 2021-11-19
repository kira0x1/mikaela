import { MessageEmbed } from 'discord.js';

import { Command } from '../../classes/Command';
import { getPlayer } from '../../util/musicUtil';
import { embedColor } from '../../util/styleUtil';

export const command: Command = {
   name: 'Pause',
   description: 'Pause the currently playing song',
   aliases: ['ps'],

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message.guildId);

      // Make sure a player exists
      if (!player) return;

      // Pause the player
      player.pause();

      const embed = new MessageEmbed();
      embed.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));
      embed.setTitle(`Paused ${player.currentlyPlaying.title}`);
      embed.setColor(embedColor);

      message.channel.send({ embeds: [embed] });
   }
};
