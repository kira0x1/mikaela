import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';

export const command: Command = {
   name: 'join',
   description: 'Joins voice',

   execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message.guildId);

      if (player) {
         // Join the VoiceChannel
         player.join(message);
      }
   }
};
