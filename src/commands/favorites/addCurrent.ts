import { Command } from '../../classes/Command';
import { getPlayer } from '../../util/musicUtil';
import { quickEmbed, sendErrorEmbed } from '../../util/styleUtil';
import { Song } from '../../classes/Song';
import { getSong, isPlaylist } from '../../util/apiUtil';
import { addFavoriteToUser } from '../../database/api/userApi';

export const command: Command = {
   name: 'AddCurrent',
   description: 'Adds the currently playing song to your favorites',
   aliases: ['addnp', 'fnp', 'addcurrent', 'favnp'],
   isSubCommand: false,

   async execute(message, args) {
      const player = getPlayer(message);
      const currentSong: Song = player.currentlyPlaying;

      if (!currentSong) {
         sendErrorEmbed(message, `No song currently playing`);
         return;
      }

      const song = await getSong(currentSong.id);

      if (!song) {
         sendErrorEmbed(message, `Error while trying to fetch song`);
         return;
      }

      if (isPlaylist(song)) {
         quickEmbed(message, 'Cannot add playlists to your favorites... this feature is coming soon.', {
            autoDelete: true
         });
         return;
      }

      addFavoriteToUser(message.author, song, message);
   }
};
