import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';

export const command: Command = {
   name: 'stop',
   description: 'stops the music player',
   aliases: ['end', 's', 'dc', 'disconnect', 'leave', 'quit'],
   hasInteraction: true,

   execute(message, args) {
      const player = getPlayer(message.guildId);
      if (player) {
         player.leave();
      }
   },

   executeInteraction(interaction) {
      const player = getPlayer(interaction.guildId);
      if (player) {
         player.leave();
      }

      interaction.reply('Stopped playing');
   }
};
