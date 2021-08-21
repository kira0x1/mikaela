import { Command } from '../../classes/Command';
import { findPlayer } from '../../util/musicUtil';
import { quickEmbed } from '../../util/styleUtil';
import ms from 'ms';

export const command: Command = {
   name: 'Seek',
   description: 'Seek the current song forward or backward in time 🕓',
   aliases: ['sk'],
   usage: '[amount: I.E .seek 10s or .seek -10s]',
   args: true,

   async execute(message, args) {
      const arg = args.shift();
      const seekAmount = ms(arg);
      if (!seekAmount) return quickEmbed(message, `\`${arg}\` is not a valid amount`);

      const player = findPlayer(message.guild.id);
      player.seek(seekAmount);
   }
};
