import { Message } from 'discord.js';
import ms from 'ms';
import { Command } from '../../classes/Command';
import { createReminder } from '../../database/api/reminderApi';
import { IReminder } from '../../database/models/Reminders';
import { sendArgsError } from '../../util/commandUtil';
import { createFooter } from '../../util/styleUtil';

export const command: Command = {
   name: 'Reminder',
   description: 'Set a reminder',
   aliases: ['remind', 'rm'],
   args: true,
   usage: '[time: 2m] [message: take a break]',

   async execute(message, args) {
      const timeArg = args.shift();
      setReminder(message, timeArg, args.join(' '));
   }
};

export async function setReminder(message: Message, time: string, content: string) {
   // If user didnt give a message then tell the user the usage of the command
   if (!time) return sendArgsError(command, message);

   let description = `remind ${message.author.username} `;
   if (content) description += `to ${content} `;
   description += `in ${time}`;

   // Create embed
   const embed = createFooter(message).setTitle('Reminder set').setDescription(description);

   // Send embed telling the user that the reminder was created
   message.channel.send(embed);

   const msTime = ms(time);
   let dbReminder: IReminder | undefined;

   if (msTime > ms('1h')) {
      dbReminder = await createReminder(message.member, message.channel.id, content, ms(time));
   }

   // Create reminder time out
   setTimeout(() => onReminder(message, content, dbReminder), ms(time));
}

export function onReminder(message: Message, content: string, dbReminder?: IReminder) {
   message.reply(`Reminder to ${content}`);

   if (dbReminder) {
      dbReminder.delete();
   }
}
