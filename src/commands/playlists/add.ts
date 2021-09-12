import { Command } from '../../classes/Command';
import { getPlaylists } from '../../database/api/playlistApi';
import { findOrCreate } from '../../database/api/userApi';
import { getSong } from '../../util/apiUtil';
import { createFooter, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'Add',
   description: 'Add a song or multiple songs to your playlist',
   usage: '[playlist index] [search | url]',
   args: true,
   isSubCommand: true,

   async execute(message, args) {
      if (!Number(args[0])) {
         return quickEmbed(message, `playlist index must be a number`);
      }

      let playlistIndex = Number(args.shift());

      const target = await findOrCreate(message.author);
      const playlists = await getPlaylists(target._id);

      playlistIndex--;

      if (playlists.length < playlistIndex || !playlists[playlistIndex]) {
         return quickEmbed(message, `playlist at index \"${playlistIndex++}\" not found`);
      }

      const playlist = playlists[playlistIndex];

      const songQuery = args.join(' ');
      const song = await getSong(songQuery, true);

      // If song not found, tell the user.
      if (!song) return quickEmbed(message, 'Song not found');

      if (song instanceof Array) {
         playlist.songs.push(...song);
         playlist.save();

         const embed = createFooter(message).setTitle(
            `Added ${song.length} songs to playlist: ${playlist.title}`
         );

         message.channel.send(embed);
         return;
      }

      playlist.songs.push(song);
      playlist.save();

      const embed = createFooter(message).setTitle(`Added ${song.title} to playlist: ${playlist.title}`);
      message.channel.send(embed);
   }
};
