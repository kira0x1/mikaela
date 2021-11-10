import { MessageEmbed } from 'discord.js';

import { createDeleteCollector, getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';
import { embedColor, createFooter } from '../../util/styleUtil';
import { logger } from '../../system';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'shuffle queue',
   description: 'shuffle the queue',
   aliases: ['sq', 'shuffleq', 'shufflequeue'],

   async execute(message, args) {
      const player = getPlayer(message);
      if (!player) return logger.log('error', `Could not find player for guild ${message.guild.name}`);

      if (!player.queue.songs || player.queue.songs.length === 0) {
         const embed = new MessageEmbed()
            .setTitle(`No songs currently playing to shuffle`)
            .setColor(embedColor);

         const msg = message.channel.send({ embeds: [embed] });
         createDeleteCollector(msg, message);
         return;
      }

      player.queue.shuffle();

      const embed = createFooter(message)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Shuffled The Queue!`)
         .setDescription(`Shuffled ${player.getSongs().length} songs`);

      const msg = message.channel.send({ embeds: [embed] });
      createDeleteCollector(msg, message);

      updateLastQueue(message);
   }
};
