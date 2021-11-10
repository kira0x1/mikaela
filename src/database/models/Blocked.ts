import { Collection } from 'discord.js';
import { model, Schema, Document } from 'mongoose';
import { logger } from '../../system';

// A list of user id's
export const blockedUsers: Collection<string, string> = new Collection();

export interface IBlocked extends Document {
   name: string;
   id: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlockedListSchema = new Schema({
   name: { type: String },
   id: { type: String, required: true, unique: true },
   createdAt: Date
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BlockedModel = model<IBlocked>('BlockedUsers', BlockedListSchema);

export async function AddBlocked(name: string, id: string) {
   try {
      if (await BlockedModel.findOne({ id: id })) {
         return logger.info('User already exists');
      }
      blockedUsers.set(id, name);
      return await new BlockedModel({ name: name, id: id }).save();
   } catch (err) {
      logger.error(err);
   }
}

export async function UnBlock(id: string) {
   try {
      const user = await BlockedModel.findOne({ id: id });
      if (!user) return logger.warn(`blocked user not found`);
      user.delete();
      blockedUsers.delete(id);
   } catch (err) {
      logger.error(err);
   }
}

export async function CacheBlockedList() {
   try {
      const blist = await BlockedModel.find();
      blist.map(doc => blockedUsers.set(doc.id, doc.name));
   } catch (err) {
      logger.error(err);
   }
}
