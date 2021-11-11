import {
   ButtonInteraction,
   CacheType,
   Client,
   Collection,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed,
   User,
   VoiceChannel
} from 'discord.js';
import {
   convertPlaylistToSongs,
   createFooter,
   embedColor,
   getSong,
   isPlaylist,
   quickEmbed,
   sendArgsError
} from '.';
import ms from 'ms';
import { Command, IDuration, Player, Song } from '../classes';
import { sendQueueEmbed } from '../commands/music/queue';
import { args } from '../config';
import { addFavoriteToUser, getAllServers } from '../database';
import { logger } from '../system';
import { randomUUID } from 'crypto';

export const players: Collection<string, Player> = new Collection();

export function ConvertDuration(durationSeconds: number | string) {
   let minutes: number = Math.floor(Number(durationSeconds) / 60);
   let seconds: number | string = Math.floor(Number(durationSeconds) - minutes * 60);
   let hours = Math.floor(minutes / 60);

   if (seconds < 10) seconds = '0' + seconds;

   const duration: IDuration = {
      seconds: seconds.toString(),
      minutes: minutes.toString(),
      hours: hours.toString(),
      duration: `${minutes}:${seconds}`,
      totalSeconds: Number(durationSeconds)
   };

   return duration;
}

export async function initPlayers(client: Client) {
   client.guilds.cache.map(async guild => {
      const guildResolved = await client.guilds.fetch(guild.id);
      players.set(guildResolved.id, new Player(guildResolved, client));
   });

   if (args['skipDB']) {
      logger.info(`Persistant Queue disabled, due to skipDB flag`);
      return;
   }

   const servers = await getAllServers(client.guilds.cache.map(server => server));
   const serverWithSongs = servers.filter(server => server.queue && server.queue.length > 0);

   for (const server of serverWithSongs) {
      const player = findPlayer(server.serverId);
      player.queue.songs = server.queue;

      const channels = player.guild.channels.cache;
      const voiceChannels: VoiceChannel[] = [];

      channels.forEach(channel => {
         if (channel instanceof VoiceChannel) voiceChannels.push(channel);
      });
   }
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

export async function createCurrentlyPlayingEmbed(player: Player, message: Message) {
   const songBar = await player.getProgressBar();
   const song = player.currentlyPlaying;
   const url = song.spotifyUrl ? song.spotifyUrl : song.url;

   // Create embed
   return createFooter(message)
      .setColor(embedColor)
      .setTitle(`Playing: ${player.currentlyPlaying.title}`)
      .setURL(url)
      .addField(
         `**${player.getDurationPretty()}**\n${songBar}`,
         getSongSourceInfo(player.currentlyPlaying)
      );
}

export async function createFavoriteCollector(song: Song, message: Message, btnId: string) {
   const filter = (i: ButtonInteraction<CacheType>) => {
      return i.customId === btnId;
   };

   const collector = message.createMessageComponentCollector({
      filter,
      componentType: 'BUTTON',
      time: ms('6h')
   });

   const userCooldowns: Collection<string, number> = new Collection();

   collector.on('collect', async i => {
      if (!i.isButton()) return;

      const user = i.user;
      const inCooldown = getFavReactionCooldown(user, userCooldowns);

      if (!inCooldown) {
         userCooldowns.set(user.id, Date.now());
         addFavoriteToUser(user, song, message);
      }

      i.update({});
   });
}

function getFavReactionCooldown(user: User, userCooldowns: Collection<string, number>) {
   const now = Date.now();

   if (!userCooldowns.has(user.id)) {
      userCooldowns.set(user.id, now);
      return false;
   }

   const expTime = userCooldowns.get(user.id) + ms('5m');
   return now < expTime;
}

export function randomUniqueArray<T>(array: Array<T>) {
   const random = randomNumber(0, array.length - 1);
   return () => array[random()];
}

export function randomNumber(min: number, max: number) {
   let previousValue;
   return function random() {
      const number = Math.floor(Math.random() * (max - min + 1) + min);
      previousValue = number === previousValue && min !== max ? random() : number;
      return previousValue;
   };
}

export async function onSongRequest(
   message: Message,
   args: string[],
   command: Command,
   onlyAddToQueue = false
) {
   const player = getPlayer(message);

   // Make sure the user is in voice
   if (!message.member.voice.channel) {
      return quickEmbed(message, `You must be in a voice channel to play music`);
   }

   if (args.length === 0) {
      if (onlyAddToQueue) return resumeQueue(message, player);
      return sendArgsError(command, message);
   }

   // Get the users query
   let query = args.join(' ');

   // Search for song
   const song = await getSong(query, true);

   // If song not found, tell the user.
   if (!song) return quickEmbed(message, 'Song not found');

   if (song instanceof Array) {
      const firstSong = song[0];
      if (song.length === 0 || !firstSong) return quickEmbed(message, 'Song not found');

      firstSong.playedBy = message.author.id;
      player.addSong(firstSong, message);

      let songCount = 1;

      for (let i = 1; i < song.length; i++) {
         if (!song[i]) continue;
         songCount++;
         song[i].playedBy = message.author.id;
         player.queue.addSong(song[i]);
      }

      const embed = createFooter(message).setTitle(`Added ${songCount} songs to queue`);
      message.channel.send({ embeds: [embed] });
      return;
   }

   if (isPlaylist(song)) {
      const playlistSongs = await convertPlaylistToSongs(song);

      const firstSong = playlistSongs[0];
      player.addSong(firstSong, message, onlyAddToQueue);

      const embed = createFooter(message)
         .setTitle(`Playlist: ${song.title}\n${song.items.length} Songs`)
         .setDescription(
            `Playing ${firstSong.title}\n${
               firstSong.spotifyUrl ? firstSong.spotifyUrl : firstSong.url
            }\n\u200b`
         );

      for (let i = 1; i < playlistSongs.length && i < 20; i++) {
         const psong = playlistSongs[i];
         embed.addField(`${i + 1} ${psong.title}`, psong.spotifyUrl ? psong.spotifyUrl : psong.url);
         player.queue.addSong(psong);
      }

      message.channel.send({ embeds: [embed] });
      return;
   }

   // Otherwise play the song
   playSong(message, song, onlyAddToQueue);
}

export async function playSong(message: Message, song: Song, onlyAddToQueue = false) {
   // Get the guilds player
   const player = getPlayer(message);

   song.playedBy = message.author.id;

   // Add the song to the player
   player.addSong(song, message, onlyAddToQueue);

   // Tell the user
   let embed = createFooter(message)
      .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(song.title)
      .setDescription(`**Added to queue**\n${song.duration.duration}`)
      .setURL(song.spotifyUrl ? song.spotifyUrl : song.url);

   const btnId = randomUUID();
   const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId(btnId).setLabel('Add To Favorites').setStyle('PRIMARY')
   );

   const msg = await message.channel.send({ embeds: [embed], components: [row] });
   createFavoriteCollector(song, msg, btnId);
}

async function resumeQueue(message: Message, player: Player) {
   if (!player.hasSongs()) {
      const embed = new MessageEmbed().setColor(embedColor).setTitle('Queue Empty, please add a song');
      message.channel.send({ embeds: [embed] });
      return;
   }

   player.resumeQueue(message);
   const embed = createFooter(message).setTitle('Resuming Queue!');
   await message.channel.send({ embeds: [embed] });
   sendQueueEmbed(message);
}

export function getSongSourceInfo(song: Song) {
   let sourceInfo = `<@${song.playedBy}>`;
   if (song.favSource && song.favSource !== song.playedBy) {
      sourceInfo += ` from <@${song.favSource}>'s favorites`;
   }
   return sourceInfo;
}
