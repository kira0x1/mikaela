import { Command } from '../../classes/Command';
import { createCurrentlyPlayingEmbed, createFavoriteCollector, getPlayer } from '../../util/musicUtil';
import { quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'Now Playing',
   description: 'Display the currently playing song',
   aliases: ['np', 'playing', 'current', 'c', 'nowplaying', 'currentsong'],

   async execute(message, args) {
      // Get the guilds current player
      const player = getPlayer(message);
      if (!player) return;

      const currentSong = player.currentlyPlaying;
      const stream = player.getStream();

      if (!(stream && player.currentlyPlaying)) return quickEmbed(message, 'No song currently playing');

      // Create embed
      const embed = await createCurrentlyPlayingEmbed(player, message);

      const msg = await message.channel.send(embed);
      createFavoriteCollector(currentSong, msg);
   }
};
