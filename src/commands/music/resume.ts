import { MessageEmbed } from 'discord.js';
import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';
import { embedColor, quickEmbed } from '../../util/styleUtil';

export const command: Command = {
   name: 'Resume',
   description: 'Resume the currently paused song',
   aliases: ['unpause', 'continue'],
   hidden: true,

   async execute(message, args) {
      // Get the guilds player
      const player = getPlayer(message);

      // Make sure a player exists
      if (!player) return;

      // If theres no song playing or if the stream dispatcher is undefined exit out
      if (!player.currentlyPlaying || !player.getStream())
         return quickEmbed(message, `No song currently playing to resume`);

      // If its not paused exit out
      if (!player.stream.paused) return quickEmbed(message, `Player isnt paused`);

      // If its paused go ahead with unpausing the stream
      player.unpause();

      // Create an embed to tell the user the stream has been paused
      const embed = new MessageEmbed()
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
         .setTitle(`Resuming ${player.currentlyPlaying.title}`)
         .setColor(embedColor);

      // Send an embed confirming the stream has been paused
      message.channel.send(embed);
   }
};
