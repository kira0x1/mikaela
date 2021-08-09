import { Command } from '../../classes/Command';
import {
   createCurrentlyPlayingEmbed,
   createDeleteCollector,
   createFavoriteCollector,
   getPlayer
} from '../../util/musicUtil';

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
         return quickEmbed(message, 'No song currently playing', { addDeleteCollector: true });
      }

      // Create embed
      const embed = await createCurrentlyPlayingEmbed(player, message);

      const msg = await message.channel.send({ embeds: [embed] });
      await createFavoriteCollector(currentSong, msg);
      await createDeleteCollector(msg, message);
   }
};
