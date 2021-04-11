import chalk from 'chalk';
import { Client, Collection, Message, MessageEmbed, MessageReaction, StreamDispatcher, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../app';
import { Player } from '../classes/Player';
import { IDuration } from "../classes/Song";
import { Song } from "../classes/Song";
import { addFavoriteToUser } from '../database/api/userApi';
import { createFooter, embedColor, QuickEmbed } from './styleUtil';
import { heartEmoji, initEmoji } from './discordUtil';
import createBar from 'string-progressbar';
import { getInfo } from 'ytdl-core';
import { sendQueueEmbed } from '../commands/music/queue';
import { convertPlaylistToSongs, getSong, isPlaylist } from './apiUtil';

export const players: Collection<string, Player> = new Collection();

export function ConvertDuration(duration_seconds: number | string) {
   let minutes: number = Math.floor(Number(duration_seconds) / 60);
   let seconds: number | string = Math.floor(Number(duration_seconds) - minutes * 60);
   let hours = Math.floor(minutes / 60);

   if (seconds < 10) seconds = '0' + seconds;

   const duration: IDuration = {
      seconds: seconds.toString(),
      minutes: minutes.toString(),
      hours: hours.toString(),
      duration: `${minutes}:${seconds}`,
      totalSeconds: Number(duration_seconds)
   };

   return duration;
}

export function initPlayers(client: Client) {
   initEmoji(client)
   client.guilds.cache.map(async guild => {
      const guildResolved = await client.guilds.fetch(guild.id);
      logger.log('info', chalk.bgBlue.bold(`${guildResolved.name}, ${guildResolved.id}`));
      players.set(guildResolved.id, new Player(guildResolved, client));
   });
}

export function getPlayer(message: Message): Player {
   const guildId = message.guild.id;
   const playerFound = findPlayer(guildId);

   if (playerFound) {
      return playerFound;
   }

   return setNewPlayer(message.client, guildId);
}

export function setNewPlayer(client: Client, guildId: string): Player {
   const guild = client.guilds.cache.get(guildId);
   const player = new Player(guild, client);
   players.set(guild.id, player);
   return player;
}

export function findPlayer(guildId: string): Player {
   return players.get(guildId);
}

export async function createCurrentlyPlayingEmbed(stream: StreamDispatcher, player: Player) {
   let streamTime = (stream.streamTime - stream.pausedTime) / 1000;
   const seekTime = player.currentlyPlayingStopTime

   if (seekTime > 0) streamTime += seekTime
   else if (seekTime < 0) logger.warn(`seek time is negative!\nseek: ${seekTime}`)

   const minutes = Math.floor(streamTime / 60);

   let seconds: number | string = streamTime - minutes * 60;
   seconds = seconds < 10 ? '0' + seconds.toFixed(0) : seconds.toFixed(0);

   const duration = player.currentlyPlaying.duration;

   let prettyTime = minutes.toFixed(0) + ':' + seconds;

   let total = duration.totalSeconds
   if (!total) {
      const song = await getInfo(player.currentlyPlaying.url)
      total = Number(song.videoDetails.lengthSeconds)
      player.currentlyPlaying.duration.totalSeconds = total
   }

   const current = streamTime
   const songBar = createBar(total, current, 20)[0]

   //Create embed
   return new MessageEmbed()
      .setColor(embedColor)
      .setTitle('Playing: ' + player.currentlyPlaying.title)
      .setURL(player.currentlyPlaying.url)
      .addField(`${prettyTime} / ${duration.duration}`, songBar)
}

export async function createFavoriteCollector(song: Song, message: Message) {
   await message.react(heartEmoji.id);

   const filter = (reaction: MessageReaction, user: User) => {
      return reaction.emoji.name === heartEmoji.name && !user.bot;
   };

   const collector = message.createReactionCollector(filter, { time: ms('1h') });

   collector.on('collect', async (reaction, reactionCollector) => {
      const user = reaction.users.cache.last();
      addFavoriteToUser(user, song, message)
   });

   collector.on('end', collected => {
      message.reactions.removeAll().catch(err => logger.log('error', err));
   });
}

export function randomUniqueArray<T>(array: Array<T>) {
   const random = randomNumber(0, array.length - 1);
   return () => array[random()];
}

export function randomNumber(min: number, max: number) {
   let previousValue;
   return function random() {
      const number = Math.floor(
         (Math.random() * (max - min + 1)) + min
      );
      previousValue = number === previousValue && min !== max ? random() : number;
      return previousValue;
   };
}

export async function onSongRequest(message: Message, args: string[], onlyAddToQueue: boolean = false) {

   //Make sure the user is in voice
   if (!message.member.voice.channel) {
      return QuickEmbed(message, `You must be in a voice channel to play music`);
   }

   const player = getPlayer(message)

   if (args.length === 0 && onlyAddToQueue) {
      resumeQueue(message, player)
      return
   }

   //Get the users query
   let query = args.join(' ');

   //Search for song
   const song = await getSong(query);

   //If song not found, tell the user.
   if (!song) return QuickEmbed(message, 'Song not found');

   if (isPlaylist(song)) {
      const playlistSongs = await convertPlaylistToSongs(song);

      const firstSong = playlistSongs[0];
      player.addSong(firstSong, message, onlyAddToQueue)

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
   playSong(message, song, onlyAddToQueue);
}

export async function playSong(message: Message, song: Song, onlyAddToQueue: boolean = false) {
   //Get the guilds player
   const player = getPlayer(message);

   //Add the song to the player
   player.addSong(song, message, onlyAddToQueue);

   //Tell the user
   let embed = createFooter(message)
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.url)

   const msg = await message.channel.send(embed);
   createFavoriteCollector(song, msg)
}

async function resumeQueue(message: Message, player: Player) {
   if (!player.hasSongs()) {
      const embed = new MessageEmbed()
         .setColor(embedColor)
         .setTitle("Queue Empty, please add a song")

      message.channel.send(embed)
      return;
   }

   player.resumeQueue(message)
   const embed = createFooter(message).setTitle("Resuming Queue!")
   await message.channel.send(embed)
   sendQueueEmbed(message)
}