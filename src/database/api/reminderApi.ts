import { GuildMember } from 'discord.js';
import { logger } from '../../system';
import { IReminder, Reminder } from '../models/Reminders';

export async function getReminders(userId: string): Promise<IReminder[]> {
   try {
      const reminders = await Reminder.find({ userId: userId });
      return reminders;
   } catch (error) {
      logger.error(error);
   }
}

export async function createReminder(
   member: GuildMember,
   channelId: string,
   content: string,
   remindAt: number,
   botId: string
) {
   try {
      const { guild, user } = member;

      return await new Reminder({
         userId: user.id,
         userTag: user.tag,
         guildId: guild.id,
         guildName: guild.name,
         channelId: channelId,
         content: content,
         remindAt: remindAt,
         botId: botId,
         createdAt: Date.now()
      }).save();
   } catch (error) {
      logger.error(error);
   }
}

export async function getAllReminders(): Promise<IReminder[]> {
   try {
      return await Reminder.find();
   } catch (error) {
      logger.error(error);
   }
}
