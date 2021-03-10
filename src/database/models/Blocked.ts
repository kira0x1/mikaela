import chalk from 'chalk';
import { Collection } from 'discord.js';
import { model, Schema, Document } from 'mongoose';
import { logger } from '../../app';

//A list of user id's
export const blockedUsers: Collection<string, string> = new Collection();

export interface IBlocked extends Document {
   name: string;
   id: string;
}

export const BlockedListSchema = new Schema({
   name: { type: String },
   id: { type: String, required: true, unique: true },
   createdAt: Date
});

export const blockedModel = model<IBlocked>('BlockedUsers', BlockedListSchema);

export async function AddBlocked(name: string, id: string) {
   try {
      if (await blockedModel.findOne({ id: id })) {
         return logger.log('info', chalk.bgMagenta.bold('User already exists'));
      }
      logger.log('info', 'adding blocked user');
      blockedUsers.set(id, name);
      return await new blockedModel({ name: name, id: id }).save();
   } catch (err) {
      logger.log('error', err);
   }
}

export async function CacheBlockedList() {
   try {
      const blist = await blockedModel.find();
      blist.map(doc => blockedUsers.set(doc.id, doc.name));
   } catch (err) {
      logger.log('error', err);
   }
}
