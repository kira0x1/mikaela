import ms from 'ms';
import { Command } from '../../classes';
import { getJobsById } from '../../system';
import { createFooter } from '../../util';

export const command: Command = {
   name: 'list',
   description: 'list reminders',
   isSubCommand: true,

   async execute(message, args) {
      const jobs = await getJobsById(message.author.id);
      const embed = createFooter(message);

      if (jobs.length === 0) {
         embed.setTitle(`You have no reminders running`);
      }

      let i = 1;
      for (const j of jobs) {
         const dueDate = j.attrs.nextRunAt;
         const now = Date.now();
         const timeLeft = Math.max(dueDate.getTime() - now, 0);

         let content = `**Frequency**: ${j.attrs.repeatInterval}\n`;
         content += `**Due**: ${ms(timeLeft, { long: true })}`;

         embed.addField(`${i}: ${j.attrs.data.content}`, content);
         i++;
      }

      message.channel.send({ embeds: [embed] });
   }
};
