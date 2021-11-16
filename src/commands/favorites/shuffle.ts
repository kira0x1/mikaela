import { Message, MessageEmbed, User } from 'discord.js';
import { logger } from '../../system';
import { Command, Song } from '../../classes';
import * as db from '../../database';
import * as util from '../../util';
import * as config from '../../config';

const maxShuffleAmount = 100;

export const command: Command = {
   name: 'shuffle',
   description: 'Shuffle songs from a favorites list',
   usage: '[amount: optional] [target: optional]',
   aliases: ['random', 'mix', 'rand', 'sh'],
   cooldown: 1,

   async execute(message, args) {
      if (!config.joinTestVc && !message.member.voice?.channel) {
         return util.quickEmbed(message, 'You must be in a voice channel to use this command');
      }

      let amount = 1;

      args.find((arg, pos) => {
         if (Number(arg)) {
            amount = Number(arg);
            args.splice(pos, 1);
         }
      });

      let target = message.author;
      if (args.length > 0) target = await util.getTarget(message, args.join(' '));

      if (!target) return util.quickEmbed(message, `Could not find user \`${args.join(' ')}\``);

      const user = await db.findOrCreate(target);

      if (!user.favorites || user.favorites.length === 0) {
         return util.sendErrorEmbed(
            message,
            `Cannot shuffle from user <@${user.id}>\nuser must add songs to their favorites list first`,
            { errorTitle: 'User has no favorites' }
         );
      }

      const player = util.getPlayer(message);
      if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

      if (amount > maxShuffleAmount) {
         amount = maxShuffleAmount;
      }

      const random = util.randomUniqueArray(user.favorites);
      const firstSong = random();

      const favSource = user.id;
      const playedBy = message.author.id;

      firstSong.favSource = favSource;
      firstSong.playedBy = playedBy;

      let startIndex = 1;

      player.addSong(firstSong, message);

      const songsAdding = [firstSong];

      for (let i = startIndex; i < amount; i++) {
         let song = random();

         if (songsAdding.includes(song) && songsAdding.length < user.favorites.length) {
            let hasFoundSong = false;
            while (!hasFoundSong) {
               song = random();
               if (!songsAdding.includes(song)) hasFoundSong = true;
            }
         }

         song.favSource = favSource;
         song.playedBy = playedBy;

         songsAdding.push(song);
         player.addSong(song, message, true);
      }

      sendShuffleEmbed(message, songsAdding, target, user);
   }
};

function sendShuffleEmbed(message: Message, songs: Song[], target: User, user: db.IUser) {
   const title = `Shuffling ${songs.length} ${songs.length > 1 ? 'songs' : 'song'} from ${user.username}`;

   const embed = new MessageEmbed()
      .setTitle(title)
      .setAuthor(target.username, target.displayAvatarURL({ dynamic: true }))
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setColor(util.embedColor);

   message.channel.send({ embeds: [embed] });
}
