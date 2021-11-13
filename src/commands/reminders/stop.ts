import { Command } from '../../classes';
import { getJobsById } from '../../system';
import { quickEmbed, sendArgsError } from '../../util';

export const command: Command = {
   name: 'stop',
   description: 'stops a reminder',
   usage: '[index]',
   isSubCommand: true,

   async execute(message, args) {
      const reminderIndex = Number(args.shift());
      if (!reminderIndex || isNaN(reminderIndex) || reminderIndex <= 0) {
         return sendArgsError(this, message);
      }

      const jobs = await getJobsById(message.author.id);
      const jobFound = jobs[reminderIndex - 1];

      if (!jobFound) {
         return quickEmbed(message, `Could not find reminder at index: ${reminderIndex}`);
      }

      await jobFound.remove();

      quickEmbed(message, `Disabled reminder at index: ${reminderIndex}`);
   }
};
