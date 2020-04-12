import { RichEmbed } from 'discord.js';
import { getPlayer } from '../../app';
import { ICommand } from '../../classes/Command';
import ms = require('ms');

export const command: ICommand = {
   name: 'GetDuration',
   description: 'Display the stream time',

   aliases: ['gd', 'time', 'elapsed'],

   execute(message, args) {
      const player = getPlayer(message);

      if (!player) return;

      const stream = player.getStream();

      if (stream && player.currentlyPlaying) {
         const streamTime = stream.time / 1000;

         const minutes = Math.floor(streamTime / 60);
         const seconds = streamTime - minutes * 60;

         const duration = player.currentlyPlaying.duration;

         let prettyTime = seconds.toFixed(0) + 's';

         if (minutes > 0) {
            prettyTime = minutes.toFixed(0) + ':' + seconds.toFixed(0) + 'm';
         }

         const minutesLeft = Number(duration.minutes) - minutes;
         const secondsLeft = Number(duration.seconds) - seconds;

         const embed = new RichEmbed();
         embed.setTitle(`Time left: ${minutesLeft.toFixed(0)}:${secondsLeft.toFixed(0)}`);
         embed.setDescription(`${prettyTime} / ${duration.duration}`);
         message.channel.send(embed);
      }
   },
};
