import { Client, TextChannel } from 'discord.js';
import { getAllReminders } from '../database/api/reminderApi';
import { IReminder } from '../database/models/Reminders';

export async function syncReminders(client: Client) {
   const reminders = await getAllReminders();
   const remindersToDelete: IReminder[] = [];

   for (const reminder of reminders) {
      const timeToRemind = reminder.remindAt + reminder.createdAt;
      const timeLeft = timeToRemind - Date.now();

      if (timeLeft <= 0) {
         remindersToDelete.push(reminder);
         continue;
      }

      setTimeout(() => sendReminder(reminder, client), timeLeft);
   }

   for (const reminder of remindersToDelete) {
      reminder.delete();
   }
}

async function sendReminder(reminder: IReminder, client: Client) {
   const guild = client.guilds.cache.find(g => g.id === reminder.guildId);
   if (!guild) return;
   const channel = guild.channels.cache.find(c => c.id === reminder.channelId);
   if (!channel || !(channel instanceof TextChannel)) return;
   channel.send(`Reminder: ${reminder.content}`, { reply: reminder.userId });
}
