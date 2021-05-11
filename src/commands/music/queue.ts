import { Collection, Constants, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { createDeleteCollector, getPlayer, getSongSourceInfo } from '../../util/musicUtil';
import { createFooter, wrap } from '../../util/styleUtil';
import { getPages } from '../favorites/list';

interface QueueCall {
   message: Message;
   pageAt: number;
}

export const queueCalls: Collection<string, QueueCall> = new Collection();

export const command: Command = {
   name: 'Queue',
   description: 'Displays the queue',
   aliases: ['q'],

   async execute(message, args) {
      sendQueueEmbed(message);
   }
};

export async function sendQueueEmbed(message: Message) {
   const embed = await getQueue(message);
   const lastQueueCall = await message.channel.send(embed);

   queueCalls.set(message.guild.id, { message: lastQueueCall, pageAt: 0 });

   const songs = getPlayer(message).getSongs();

   if (songs.length > 5) await createQueuePagination(lastQueueCall, embed, message.author);
   createDeleteCollector(lastQueueCall, message);
}

export async function getQueue(message: Message) {
   //Get the guilds player
   const player = getPlayer(message);

   const songs = player.getSongs();
   const pages = getPages(songs);
   const queueEmbed = await createQueueEmbed(message, pages);

   return queueEmbed;
}

export async function updateLastQueue(message: Message) {
   const lastQueue = queueCalls.get(message.guild.id);
   if (!lastQueue) return;
   const queueEmbed = await getQueue(message);
   lastQueue.message.edit(queueEmbed);
   updateQueueMessage(lastQueue);
}

export async function updateQueueMessage(queueCall: QueueCall) {
   const message = queueCall.message;
   queueCall.pageAt = 0;
   const player = getPlayer(message);
   const songs = player.getSongs();

   if (songs.length > 5) return;

   const emojis = ['⬅', '➡'];
   const reactions = message.reactions.cache
      .filter(r => r.me && emojis.includes(r.emoji.name))
      .map(r => r.remove());

   Promise.all(reactions);
}

async function createQueuePagination(message: Message, embed: MessageEmbed, author: User) {
   const promises = [message.react('⬅'), message.react('➡')];
   await Promise.all(promises);

   const filter = (reaction: MessageReaction, user: User) => {
      return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !user.bot;
   };

   const collector = message.createReactionCollector(filter, { time: ms('3h') });

   let pageAt = 0;

   collector.on('collect', async (reaction: MessageReaction, user: User) => {
      const songs = getPlayer(message).getSongs();
      const pages = getPages(songs);
      pageAt = queueCalls.get(message.guild.id)?.pageAt || 0;

      if (reaction.emoji.name === '➡') {
         pageAt++;
         if (pageAt >= pages.size) pageAt = 0;
      } else if (reaction.emoji.name === '⬅') {
         pageAt--;
         if (pageAt < 0) pageAt = pages.size - 1;
      }

      queueCalls.set(message.guild.id, { message, pageAt });
      reaction.users.remove(user);
      const newEmbed = await createQueueEmbed(message, pages, pageAt, author);
      message.edit(newEmbed);
   });

   collector.on('end', collected => {
      message.reactions.removeAll().catch(error => {
         if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
      });
   });
}

async function createQueueEmbed(
   message: Message,
   pages: Collection<number, Song[]>,
   pageAt = 0,
   author?: User
) {
   const player = getPlayer(message);

   //Create embed
   const embed = createFooter(message, author);

   //If the player is playing a song add it to the top of the embed
   if (player.currentlyPlaying) {
      let currentlyPlaying = player.currentlyPlaying;
      const songBar = await player.getProgressBar();

      embed.setTitle(`Playing: ${currentlyPlaying.title}`);
      embed.setDescription(
         wrap(`Queue: ${player.getSongs().length}\nPage ${pageAt + 1} / ${pages.size}`, `**`)
      );
      embed.setURL(currentlyPlaying.spotifyUrl ? currentlyPlaying.spotifyUrl : currentlyPlaying.url);

      embed.addField(
         `**${player.getDurationPretty()}**\n${songBar}`,
         `*${getSongSourceInfo(currentlyPlaying)}*`
      );
   } else {
      //If no song is currently playing
      embed.setTitle('No currently playing song');
   }

   const page = pages.get(pageAt);

   page.map((song, i) => {
      embed.addField(
         `${pageAt * 5 + (i + 1)}. ${song.title}`,
         `${song.duration.duration}  ${song.spotifyUrl ? song.spotifyUrl : song.url}\n*${getSongSourceInfo(song)}*\n`
      );
   });

   return embed;
}
