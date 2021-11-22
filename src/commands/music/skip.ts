import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { createFooter, embedColor, getPlayer, quickEmbed } from '../../util';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'Skip',
   description: 'Skip song',
   aliases: ['fs', 'next'],
   hasInteraction: true,

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message.guildId);
      if (!player) return;

      // Get the current playing song
      const currentSong = player.currentlyPlaying;
      if (!currentSong) return quickEmbed(message, `No song currently playing`);

      // Create an embed with the information of the song to be skipped
      const embed = new MessageEmbed()
         .setColor(embedColor)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Skipped Song: ${currentSong.title}`)
         .setDescription(currentSong.url);

      player.skipSong();
      message.channel.send({ embeds: [embed] });
      updateLastQueue(message);
   },

   async executeInteraction(interaction) {
      // Get the guilds player
      const player = getPlayer(interaction.guildId);
      if (!player) return;

      const author = interaction.user;

      // Get the current playing song
      const currentSong = player.currentlyPlaying;
      if (!currentSong) {
         const embed = createFooter(author).setTitle(`No song currently playing`);
         interaction.reply({ embeds: [embed] });
         return;
      }

      // Create an embed with the information of the song to be skipped
      const embed = new MessageEmbed()
         .setColor(embedColor)
         .setAuthor(author.username, author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Skipped Song: ${currentSong.title}`)
         .setDescription(currentSong.url);

      player.skipSong();
      interaction.reply({ embeds: [embed] });
      updateLastQueue(interaction);
   }
};
