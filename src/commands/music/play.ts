import { Client, Emoji, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { ICommand } from '../../classes/Command';
import { ISong } from '../../classes/Player';
import { coders_club_id } from '../../config';
import { CreateUser, IUser } from '../../db/dbUser';
import { getUser } from '../../db/userController';
import { convertPlaylistToSongs, getSong, isPlaylist } from '../../util/apiUtil';
import { getPlayer } from '../../util/musicUtil';
import { createFooter, embedColor, QuickEmbed } from '../../util/styleUtil';
import { AddFavorite } from '../favorites/add';

export let heartEmoji: Emoji;

export function initEmoji(client: Client) {
   const coders_club = client.guilds.cache.get(coders_club_id);
   if (!coders_club) return;

   const emoji = coders_club.emojis.cache.find(em => em.name === 'heart');
   if (!emoji) return console.log(`emoji not found`);

   heartEmoji = emoji;
}

export const command: ICommand = {
   name: 'play',
   description: 'Play a song',
   aliases: ['p'],
   usage: '[song]',
   args: true,

   async execute(message: Message, args: string[]) {
      //Get the users query
      let query = args.join(' ');

      //Make sure the user is in voice
      if (!message.member.voice.channel) {
         return QuickEmbed(message, `You must be in a voice channel to play music`);
      }

      //Search for song
      const song = await getSong(query);

      //If song not found, tell the user.
      if (!song) return QuickEmbed(message, 'Song not found');

      if (isPlaylist(song)) {
         const player = getPlayer(message);
         const playlistSongs = await convertPlaylistToSongs(song);

         const firstSong = playlistSongs[0];
         player.addSong(firstSong, message);

         const embed = createFooter(message)
            .setTitle(`Playlist: ${song.title}\n${song.items.length} Songs`)
            .setDescription(`Playing ${firstSong.title}\n${firstSong.url}\n\u200b`);

         for (let i = 1; i < playlistSongs.length && i < 20; i++) {
            const psong = playlistSongs[i];
            embed.addField(`${i + 1} ${psong.title}`, psong.url);
            player.queue.addSong(psong);
         }
         message.channel.send(embed);
         return;
      }

      //Otherwise play the song
      playSong(message, song);
   }
};

export async function playSong(message: Message, song: ISong) {
   //Get the guilds player
   const player = getPlayer(message);

   if (!player) return console.log('couldnt find player');
   if (!song) return message.channel.send('Couldnt find song');

   //Add the song to the player
   player.addSong(song, message);

   //Tell the user
   let embed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)
      .setColor(embedColor);

   const msg = await message.channel.send(embed);
   await msg.react(heartEmoji.id);

   const filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name === heartEmoji.name && !user.bot;
   };

   const collector = msg.createReactionCollector(filter, { time: ms('1h') });

   collector.on('collect', async (reaction, reactionCollector) => {
      const user = reaction.users.cache.last();
      let dbUser = await getUser(user.id);

      if (!dbUser) {
         const iuser: IUser = {
            username: user.username,
            tag: user.tag,
            id: user.id,
            favorites: [],
            roles: [],
            sourcesGroups: []
         };

         await CreateUser(iuser);
         dbUser = iuser;
      }

      AddFavorite(dbUser, song, message);
   });

   collector.on('end', collected => {
      msg.reactions.removeAll().catch(console.error);
   });
}
