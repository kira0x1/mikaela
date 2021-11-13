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
         embed.addField(`${i}: ${j.attrs.data.content}`, `reminds every: ${j.attrs.repeatInterval}`);
         i++;
      }

      message.channel.send({ embeds: [embed] });
   }
};
