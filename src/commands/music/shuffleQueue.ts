import { MessageEmbed } from 'discord.js';
import { Command } from '../../classes/Command';
import { embedColor, createFooter, getPlayer } from '../../util';
import { logger } from '../../system';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'shuffle queue',
   description: 'shuffle the queue',
   aliases: ['sq', 'shuffleq', 'shufflequeue'],

   async execute(message, args) {
      const player = getPlayer(message.guildId);
      if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

      if (!player.queue.songs || player.queue.songs.length === 0) {
         const embed = new MessageEmbed()
            .setTitle(`No songs currently playing to shuffle`)
            .setColor(embedColor);

         message.channel.send({ embeds: [embed] });
         return;
      }

      player.queue.shuffle();

      const embed = createFooter(message.author)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Shuffled The Queue!`)
         .setDescription(`Shuffled ${player.getSongs().length} songs`);

      message.channel.send({ embeds: [embed] });

      updateLastQueue(message);
   }
};
