import { Collection, Message, MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js';
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

   const songs = getPlayer(message).getSongs();

   const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('backQueue').setLabel('Back').setStyle('PRIMARY'),
      new MessageButton().setCustomId('nextQueue').setLabel('Next').setStyle('PRIMARY')
   );

   const lastQueueCall = await message.channel.send({
      embeds: [embed],
      components: songs.length > 5 ? [row] : []
   });

   queueCalls.set(message.guild.id, { message: lastQueueCall, pageAt: 0 });

   if (songs.length > 5) await createQueuePagination(lastQueueCall, embed, message.author);
}

export async function getQueue(message: Message) {
   // Get the guilds player
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
   lastQueue.message.edit({ embeds: [queueEmbed] });
}

async function createQueuePagination(message: Message, embed: MessageEmbed, author: User) {
   const filter = i => i.customId === 'nextQueue' || i.customId === 'backQueue';

   const collector = message.createMessageComponentCollector({ filter, time: ms('3h') });

   let pageAt = 0;

   collector.on('collect', async i => {
      if (!i.isButton()) return;

      const songs = getPlayer(message).getSongs();
      const pages = getPages(songs);
      pageAt = queueCalls.get(message.guild.id)?.pageAt || 0;

      if (i.customId === 'nextQueue') {
         pageAt++;
         if (pageAt >= pages.size) pageAt = 0;
      } else if (i.customId === 'backQueue') {
         pageAt--;
         if (pageAt < 0) pageAt = pages.size - 1;
      }

      queueCalls.set(message.guild.id, { message, pageAt });
      const newEmbed = await createQueueEmbed(message, pages, pageAt, author);
      await i.update({ embeds: [newEmbed] });
   });
}

async function createQueueEmbed(
   message: Message,
   pages: Collection<number, Song[]>,
   pageAt = 0,
   author?: User
) {
   const player = getPlayer(message);

   // Create embed
   const embed = createFooter(message, author);

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
