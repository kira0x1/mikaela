import ms from 'ms';
import { Command } from '../../classes';
import { createRepeatingReminderJob } from '../../system';
import { createFooter, quickEmbed, sendArgsError } from '../../util';

export const command: Command = {
   name: 'RemindEvery',
   description: 'Reminds you about something at a set interval\nI.E: remind me to take my meds every day',
   usage: '[time: 1d] [message: take my medication]',
   async execute(message, args) {
      const time = args.shift();
      const content = args.join(' ');

      // If user didnt give a message then tell the user the usage of the command
      if (!time) return sendArgsError(command, message);

      const msTime = ms(time);
      const prettyTime = ms(msTime, { long: true });

      if (msTime < ms('30m')) return quickEmbed(message, `Time must be greater then 30 minutes`);

      let description = `remind ${message.author.username} `;
      if (content) description += `to ${content} `;
      description += `every ${prettyTime}`;

      // Create embed
      const embed = createFooter(message).setTitle('Reminder set').setDescription(description);

      // Send embed telling the user that the reminder was created
      message.channel.send({ embeds: [embed] });

      await createRepeatingReminderJob(message.author.id, content, msTime);
   }
};
