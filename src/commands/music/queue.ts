import { randomUUID } from 'crypto';
import {
   ButtonInteraction,
   CacheType,
   Collection,
   CommandInteraction,
   Message,
   MessageActionRow,
   MessageButton,
   User
} from 'discord.js';
import ms from 'ms';
import { Command } from '../../classes/Command';
import { Song } from '../../classes/Song';
import { getPlayer, getSongSourceInfo } from '../../util/musicUtil';
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

   const songs = getPlayer(message.guildId).getSongs();

   const nextId = randomUUID();
   const backId = randomUUID();

   const components = [];

   if (songs.length > 5) {
      const row = new MessageActionRow().addComponents(
         new MessageButton().setCustomId(backId).setLabel('Back').setStyle('PRIMARY'),
         new MessageButton().setCustomId(nextId).setLabel('Next').setStyle('PRIMARY')
      );

      components.push(row);
   }

   const msg = await message.channel.send({ embeds: [embed], components });
   if (songs.length > 5) await createQueuePagination(msg, nextId, backId, message.author);
}

export async function getQueue(message: Message | CommandInteraction) {
   // Get the guilds player
   const player = getPlayer(message.guildId);

   const songs = player.getSongs();
   const pages = getPages(songs);
   const queueEmbed = await createQueueEmbed(message, pages);

   return queueEmbed;
}

export async function updateLastQueue(message: Message | CommandInteraction) {
   const lastQueue = queueCalls.get(message.guildId);
   if (!lastQueue) return;
   const queueEmbed = await getQueue(message);
   lastQueue.message.edit({ embeds: [queueEmbed] });
}

async function createQueuePagination(message: Message, nextId: string, backId: string, author: User) {
   const filter = (i: ButtonInteraction<CacheType>) => {
      return i.customId === nextId || i.customId === backId;
   };

   const collector = message.channel.createMessageComponentCollector({
      filter,
      componentType: 'BUTTON',
      time: ms('3h')
   });

   let pageAt = 0;

   collector.on('collect', async i => {
      if (!i.isButton()) return;

      const songs = getPlayer(message.guildId).getSongs();
      const pages = getPages(songs);
      pageAt = queueCalls.get(message.guild.id)?.pageAt || 0;

      if (i.customId === nextId) {
         pageAt++;
         if (pageAt >= pages.size) pageAt = 0;
      } else if (i.customId === backId) {
         pageAt--;
         if (pageAt < 0) pageAt = pages.size - 1;
      }

      queueCalls.set(message.guild.id, { message, pageAt });

      const newEmbed = await createQueueEmbed(message, pages, pageAt);
      await i.update({ embeds: [newEmbed] });
   });
}

async function createQueueEmbed(
   message: Message | CommandInteraction,
   pages: Collection<number, Song[]>,
   pageAt = 0
) {
   const player = getPlayer(message.guildId);
   const author = message instanceof Message ? message.author : message.user;

   // Create embed
   const embed = createFooter(author, author);

   // If the player is playing a song add it to the top of the embed
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
      // If no song is currently playing
      embed.setTitle('No currently playing song');
   }

   const page = pages.get(pageAt);

   page.map((song, i) => {
      embed.addField(
         `${pageAt * 5 + (i + 1)}. ${song.title}`,
         `${song.duration.duration}  ${song.spotifyUrl ? song.spotifyUrl : song.url}\n*${getSongSourceInfo(
            song
         )}*\n`
      );
   });

   return embed;
}
