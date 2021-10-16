import ms from 'ms';
import { Command } from '../../classes/Command';
import { players } from '../../util/musicUtil';
import { addCodeField, createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'Players',
   description: 'List all players',
   aliases: ['streams'],
   perms: ['kira'],

   execute(message, args) {
      const embed = createFooter(message).setTitle(`Players: ${players.size}`);
      const playing = players.filter(p => p.isPlaying).array();

      let content = '';

      for (const player of playing) {
         const songDuration = player.currentlyPlaying?.duration.duration;
         const songStreamTime = ms(player.getStreamTime(), { long: true });

         const queueLength = player.queue.songs.length;
         let field = `server: ${player.guild.name}, channel: ${player.voiceChannel.name}\n`;
         field += `queue: ${queueLength}\n`;
         field += `current: ${player.currentlyPlaying?.title}, duration: ${songDuration} / ${songStreamTime}}\n\n`;
         content += field;
      }

      if (playing.length > 0) addCodeField(embed, '---Playing---\n\n' + content);

      const notPlaying = players.filter(p => !p.isPlaying).map(p => p.guild.name);
      if (notPlaying.length > 0) addCodeField(embed, '---Not Playing---\n\n' + notPlaying.join('\n'));
      message.channel.send(embed);
   }
};
