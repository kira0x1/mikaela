import { Command } from '../../classes/Command';
import { getSong } from '../../util/apiUtil';
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

      embed.setTitle(song.title).setDescription(song.duration.duration);
      message.channel.send(embed);
   }
};
