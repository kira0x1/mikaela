import chalk from 'chalk';
import { GuildMember } from 'discord.js';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { getTarget } from '../../util/discordUtil';
import { randomNumber, getPlayer } from '../../util/musicUtil';

export const command: Command = {
   name: 'AutoQueue',
   description: "Auto Queue's random song's from peoples favorites",
   aliases: ['aq'],
   args: false,

   async execute(message, args) {
      const player = getPlayer(message);

      let vc = message.member.voice.channel;

      if (!vc && player.testVc) {
         vc = player.testVc;
         player.join(message);
      }

      const nonbot = vc.members.filter(m => !m.user.bot);

      const chosen: GuildMember[] = [];

      const ceil = Math.min(nonbot.size, 5);

      for (let i = 0; i < ceil; i++) {
         const rand = randomNumber(0, ceil);
         chosen.push(nonbot[rand()]);
      }

      const targets = chosen.map(m => getTarget(message, m.id));
      await Promise.all(targets);

      targets.map((t, i) => {
         logger.info(chalk.bgRed.bold(`Target ${i + 1}: ${t}`));
      });
   }
};
