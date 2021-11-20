import { Command } from '../../classes/Command';
import { createFooter, getPlayer, quickEmbed } from '../../util';

export const command: Command = {
   name: 'Pause',
   description: 'Pause the currently playing song',
   aliases: ['ps'],

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message);

      // Make sure a player exists
      if (!player) return;

      if (player.isPaused()) {
         return quickEmbed(message, 'Player is already paused.');
      }

      // Pause the player
      player.pause();

      const embed = createFooter(message)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Paused ${player.currentlyPlaying.title}`);

      message.channel.send({ embeds: [embed] });
   }
};
