import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { getPlaylists } from '../../database/api/playlistApi';
import { findOrCreate } from '../../database/api/userApi';
import { getTarget } from '../../util/discordUtil';
import { createFooter, embedColor, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'list',
   description: 'list your playlists, or another users playlists',
   usage: '[empty | user]',
   isSubCommand: true,

   async execute(message, args) {
      let target = message.author;
      if (args.length > 0) target = await getTarget(message, args.join(' '));

      if (!target) return quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const user = await findOrCreate(target);
      const playlists = await getPlaylists(user._id);

      if (!user || !playlists || playlists.length === 0) {
         const embed: MessageEmbed = createFooter(message)
            .setTitle(target.username + '\n\u200b')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setDescription('Playlists: none')
            .setColor(embedColor);
         return message.channel.send(embed);
      }

      let title = `**Playlists**`;
      title += `\nSongs **${playlists.length}**`;
      title += '\n\u200b';

      const embed = createFooter(message)
         .setThumbnail(target.displayAvatarURL({ dynamic: true }))
         .setTitle(title);

      for (const plist of playlists) {
         embed.addField(plist.title, `songs: ${plist.songs.length}`);
      }

      message.channel.send(embed);
   }
};
