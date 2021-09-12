import { Command } from '../../classes/Command';
import { sendErrorEmbed, createFooter } from '../../util/styleUtil';
import { findPlaylist } from './list';
import { getPlayer } from '../../util/musicUtil';

export const command: Command = {
   name: 'play',
   description: 'Play one of your playlists or someone elses',

   async execute(message, args) {
      try {
         const player = getPlayer(message);

         const res = await findPlaylist(message, args);
         if (!res.playlist) return;

         const songs = res.playlist.songs;

         const embed = createFooter(message)
            .setTitle(`Added playlist: ${res.playlist.title} to queue`)
            .setDescription(`${songs.length} songs added`);

         const firstSong = songs.shift();

         const favSource = res.target.id;
         const playedBy = message.author.id;

         firstSong.favSource = favSource;
         firstSong.playedBy = playedBy;

         player.addSong(firstSong, message);

         for (const song of songs) {
            song.favSource = favSource;
            song.playedBy = playedBy;

            player.queue.addSong(song);
         }

         message.channel.send(embed);
      } catch (error: any) {
         sendErrorEmbed(message, error.message);
      }
   }
};
