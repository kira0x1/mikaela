import { Message, User } from 'discord.js';

import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { testVc } from '../../config';
import { findOrCreate } from '../../database/api/userApi';
import { getTarget } from '../../util/discordUtil';
import { getPlayer, playSong } from '../../util/musicUtil';
import { createFooter, quickEmbed, sendErrorEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'play',
   description: 'Play a song from yours or someone elses favorites',
   aliases: ['p'],
   args: true,
   usage: '[song index | start pos - end pos (To Select Multiple Songs) ]',
   cooldown: 1,
   isSubCommand: true,

   async execute(message, args) {
      const player = getPlayer(message);
      if (!player) return;

      if (!testVc && !player.inVoice && !message.member.voice.channel)
         return quickEmbed(message, `You must be in a voice channel to play music`);

      try {
         const res = await findFavorite(message, args);

         if (!(res.song instanceof Array)) {
            res.song.playedBy = message.author.id;
            res.song.favSource = res.target.id;

            playSong(message, res.song);
            return;
         }

         const embed = createFooter(message);

         let amount = res.song.length;
         if (amount > 15) {
            embed.setFooter('Max Amount is 15!');
            amount = 15;
         }

         const firstSong = res.song.shift();

         const favSource = res.target.id;
         const playedBy = message.author.id;

         firstSong.favSource = favSource;
         firstSong.playedBy = playedBy;

         player.addSong(firstSong, message);

         embed
            .setTitle(`Playing ${amount} ${amount > 1 ? 'songs' : 'song'} from ${res.target.username}`)
            .setDescription(
               `Playing ${firstSong.title}\n${
                  firstSong.spotifyUrl ? firstSong.spotifyUrl : firstSong.url
               }\n\u200b`
            )
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(res.target.displayAvatarURL({ dynamic: true }));

         for (let i = 0; i < amount - 1; i++) {
            const song = res.song[i];

            song.favSource = favSource;
            song.playedBy = playedBy;

            embed.addField(`${i + 1} ${song.title}`, song.url);
            player.queue.addSong(song);
         }

         message.channel.send({ embeds: [embed] });
      } catch (error: any) {
         sendErrorEmbed(message, error.message);
      }
   }
};

export async function findFavorite(
   message: Message,
   args: string[]
): Promise<{ target: User; song: Song | Song[] }> {
   let songArg = '';
   let songIndex: number | undefined;

   const songRanges: number[] = [];

   for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg !== '-') continue;
      songRanges.push(Number(args[i - 1]));
      songRanges.push(Number(args[i + 1]));
      args.splice(i - 1, 3);
      break;
   }

   if (songRanges.length !== 2) {
      for (let i = 0; i < args.length; i++) {
         const arg = args[i];
         if (!Number(arg)) continue;

         songIndex = Number(arg);
         args.splice(i, 1);
         break;
      }
   }

   // ? Get User
   let target = message.author;
   if (args.length > 0) target = await getTarget(message, args.join(' '));

   if (!target) throw new Error(`Could not find user \`${args.join(' ')}\``);

   const userResult = await findOrCreate(target);
   const fav = userResult.favorites.reverse();
   if (fav.length === 0) throw new Error(`${target} has no favorites`);

   if (songRanges.length === 2) {
      const startRange = songRanges[0] - 1;
      const endRange = songRanges[1]--;

      const startValid = startRange < fav.length && startRange >= 0;
      const endValid = endRange <= fav.length && endRange > 0;

      if (!startValid || !endValid) throw new Error(`This user doesnt have songs in that range`);

      const songs = fav.slice(startRange, endRange);
      return { target: target, song: songs };
   }

   if (songIndex === undefined) throw new Error(`no song index given`);

   songIndex--;
   if (fav.length < songIndex || !fav[songIndex]) throw new Error(`song at index \"${songArg}\" not found`);
   return { target: target, song: fav[songIndex] };
}
