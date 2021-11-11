import { Command } from '../../classes/Command';
import { Player } from '../../classes/Player';
import { getPlayer, addCodeField, createFooter, quickEmbed } from '../../util';
import { updateLastQueue } from './queue';

export const command: Command = {
   name: 'remove',
   description: 'Remove a song from queue',
   usage: '[position in queue]',
   aliases: ['r'],

   async execute(message, args) {
      const player = getPlayer(message);
      if (!player) return;

      if (!player.hasSongs()) return quickEmbed(message, 'Queue is empty');

      const numbers = args.filter(arg => {
         const n = Number(arg);
         if (!isNaN(n) && n !== undefined) return n;
      });

      const arg1 = numbers[0];
      const arg2 = numbers[1];

      if (!arg1) return;

      let pos;

      try {
         pos = checkPos(arg1, player);
      } catch (error: any) {
         return quickEmbed(message, error.message);
      }

      let pos2;

      if (arg2) {
         try {
            pos2 = checkPos(arg2, player);
         } catch (error: any) {
            return quickEmbed(message, error.message);
         }
      }

      const startIndex = Math.max(0, pos - 1);

      if (pos2) {
         const deleteAmount = Math.min(pos2, player.queue.songs.length) - startIndex;
         const songs = player.queue.songs.splice(startIndex, deleteAmount);

         const embed = createFooter(message)
            .setTitle(`Removed ${songs.length} ${songs.length === 1 ? 'song' : 'songs'} from the queue`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

         addCodeField(embed, songs.map((s, i) => `${pos + i}: ${s.title}`).join('\n'));

         message.channel.send({ embeds: [embed] });
         updateLastQueue(message);
         return;
      }

      const song = player.queue.removeAt(startIndex).shift();
      if (!song) return quickEmbed(message, 'Couldnt find song');

      const embed = createFooter(message)
         .setTitle(`Removed song\n${song.title}`)
         .setURL(song.url)
         .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }));

      message.channel.send({ embeds: [embed] });
      updateLastQueue(message);
   }
};

function checkPos(arg: number | string, player: Player) {
   const pos = Number(arg);
   if (isNaN(pos)) throw new Error(`Remove position must be a number`);

   if (pos < 1 || pos > player.getSongs().length + 1) throw new Error(`Invalid position`);

   return pos;
}
