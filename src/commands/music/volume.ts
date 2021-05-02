import { getPlayer } from '../../util/musicUtil';
import { Command } from '../../classes/Command';
import { quickEmbed, wrap } from '../../util/styleUtil';
import { logger } from '../../app';
import { hasPerms } from '../../util/commandUtil';

export const command: Command = {
   name: 'volume',
   description: 'Change the volume',
   aliases: ['v'],
   usage: '[- | + | number]\n\nDisplays the volume if no arguments given',
   hidden: true,
   isDisabled: false,

   execute(message, args) {
      const arg = args.shift();
      const player = getPlayer(message);

      const member = message.member;
      if (!member.voice.channel) return quickEmbed(message, `You must be in a voice channel to play music`);

      if (!player) return logger.warn('info', 'no player found while using volume command');
      if (!arg) return quickEmbed(message, `Volume is currently ${player.volume}`);

      if (!hasPerms(message.member, this.name)) {
         return message.author.send(`You do not have permission to use ${wrap(command.name)}`);
      }

      let amount: number | undefined;

      if (arg === '-') {
         amount = player.volume - 0.5;
      } else if (arg === '+') {
         amount = player.volume + 0.5;
      } else if (Number(arg)) {
         amount = Number(arg);
      }

      if (amount) {
         player.changeVolume(amount, message);
      }
   }
};
