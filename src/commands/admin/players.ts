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

         let streamTime = player.getStreamTime();

         if (streamTime > 0) {
            streamTime *= 1000;
         }

         const songStreamTime = ms(streamTime, { long: true });

         const queueLength = player.queue.songs.length;
         let field = `server: ${player.guild.name}\nchannel: ${player.voiceChannel.name}\n\n`;
         field += `queue: ${queueLength}\n`;
         field += `current: ${player.currentlyPlaying?.title}\n duration: ${songStreamTime} / ${songDuration}\n\n`;
         content += field;
      }

      if (playing.length > 0) addCodeField(embed, '---Playing---\n\n' + content);

      const notPlayingLength = players.filter(p => !p.isPlaying).size;
      addCodeField(embed, `---Not Playing---\n\nPlayers: ${notPlayingLength}`);
      message.channel.send(embed);
   }
};
