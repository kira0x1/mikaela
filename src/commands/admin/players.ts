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
      const playing = players
         .filter(p => p.isPlaying)
         .map(p => `server: ${p.guild.name}, channel: ${p.voiceChannel.name}`);
      if (playing.length > 0) addCodeField(embed, '---Playing---\n\n' + playing.join('\n'));

      const notPlaying = players.filter(p => !p.isPlaying).map(p => p.guild.name);
      if (notPlaying.length > 0) addCodeField(embed, '---Not Playing---\n\n' + notPlaying.join('\n'));
      message.channel.send(embed);
   }
};
