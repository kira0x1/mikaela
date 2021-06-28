import { Document, model, Schema } from 'mongoose';

export interface IReminder extends Document {
   userTag: string;
   userId: string;
   guildName: string;
   guildId: string;
   channelId: string;
   content: string;
   remindAt: number;
   createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ReminderSchema = new Schema({
   userTag: { type: String, required: true },
   userId: { type: String, required: true },
   guildName: { type: String, required: true },
   guildId: { type: String, required: true },
   channelId: { type: String, required: true },
   content: { type: String, required: true },
   remindAt: { type: Number, required: true },
   createdAt: { type: Number, required: true }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Reminder = model<IReminder>('reminders', ReminderSchema);
