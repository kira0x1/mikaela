import { Command } from '../../classes/Command';
import { convertPlaylistToSongs, getSong, isPlaylist } from '../../util/apiUtil';
import { createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'search',
   description: 'Search for a song',
   args: true,

   async execute(message, args) {
      const query = args.join(' ');
      const song = await getSong(query);
      if (song instanceof Array) return;

      const embed = createFooter(message);

      if (!song) {
         embed.setTitle(`Song "${query}" not found`);
         return message.channel.send(embed);
      }

      if (isPlaylist(song)) {
         embed.setTitle(song.title).setDescription(`${song.items.length} Songs\n`);

         const songs = await convertPlaylistToSongs(song);

         for (let i = 0; i < songs.length - 1 && i < 20; i++) {
            embed.addField(`${i + 1} ${songs[i].title}`, songs[i].url);
         }

         message.channel.send(embed);
         return;
      }

      embed.setTitle(song.title).setDescription(song.duration.duration);
      message.channel.send(embed);
   }
};
