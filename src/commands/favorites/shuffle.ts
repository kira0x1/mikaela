import { ICommand } from '../../classes/Command';
import { getTarget } from '../../util/FavoritesUtil';
import { getUser } from '../../db/userController';
import { QuickEmbed, embedColor } from '../../util/Style';
import { RichEmbed } from 'discord.js';
import { getPlayer } from '../../app';

export const command: ICommand = {
   name: 'shuffle',
   description: 'Shuffle songs from a favorites list',
   usage: '[amount: optional] [target: optional]',
   aliases: ['random', 'mix'],

   async execute(message, args) {
      let amount = 1;
      args.find((arg, pos) => {
         if (Number(arg)) {
            amount = Number(arg);
            args.splice(pos, 1);
         }
      });

      let target = await getTarget(message, args.join(' '));
      const user = await getUser(target.id);

      if (!user.favorites) {
         return QuickEmbed(message, 'You have no favorites to shuffle');
      }

      const embed = new RichEmbed();
      embed.setColor(embedColor);

      const player = getPlayer(message);
      if (!player) return console.error(`Could not find player for guild ${message.guild.name}`);

      if (amount > 15) {
         embed.setFooter(`Max Amount is 15!`);
         amount = 15;
      }

      let title = `Shuffling ${amount} song from ${user.username}`;

      if (amount > 1) {
         title = `Shuffling ${amount} songs from ${user.username}`;
      }

      const firstSong = user.favorites[Math.floor(Math.random() * user.favorites.length)];
      await player.addSong(firstSong, message);

      embed.setTitle(title);
      embed.setDescription(`Playing ${firstSong.title}\n${firstSong.url}\n\u200b`);
      embed.setAuthor(message.author.username, message.author.avatarURL);
      embed.setThumbnail(target.avatarURL);

      for (let i = 0; i < amount - 1; i++) {
         let rand = Math.floor(Math.random() * user.favorites.length);
         const song = user.favorites[rand];
         embed.addField(`${i + 1} ${song.title}`, song.url);
         player.queue.addSong(song);
      }

      message.channel.send(embed);
   },
};
