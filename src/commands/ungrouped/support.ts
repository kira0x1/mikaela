import { Command } from '../../classes';
import { createFooter } from '../../util';

export const command: Command = {
   name: 'Support',
   description: 'Displays information on how to contact support for questions, and concerns.',
   async execute(message, args) {
      const embed = createFooter(message.author)
         .setTitle('Support Server')
         .setURL('https://discord.gg/6fzTAReQtj')
         .setDescription('Github repo: https://github.com/kira0x1/mikaela');

      message.channel.send({ embeds: [embed] });
   }
};
