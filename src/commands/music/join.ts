import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';

export const command: Command = {
   name: 'join',
   description: 'Joins voice',
   hasInteraction: true,

   execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message.guildId);

      if (player) {
         // Join the VoiceChannel
         player.join(message);
      }
   },

   executeInteraction(interaction) {
      // Get the guilds player
      const player = getPlayer(interaction.guildId);

      if (player) {
         // Join the VoiceChannel
         player.joinByInteraction(interaction);
      }
   }
};
