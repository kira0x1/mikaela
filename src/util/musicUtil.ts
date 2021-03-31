import chalk from 'chalk';
import { Client, Collection, Message, MessageEmbed, MessageReaction, StreamDispatcher, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../app';
import { IDuration, ISong, Player } from '../classes/Player';
import { addFavoriteToUser } from '../database/api/userApi';
import { embedColor } from './styleUtil';
import { heartEmoji, initEmoji } from './discordUtil';
import createBar from 'string-progressbar';
import { getInfo } from 'ytdl-core';

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
   const streamTime = (stream.streamTime - stream.pausedTime) / 1000;
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

export async function createFavoriteCollector(song: ISong, message: Message) {
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