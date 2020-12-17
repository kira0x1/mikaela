import chalk from 'chalk';
import { Collection } from 'discord.js';
import { model, Schema, Document } from 'mongoose';

//A list of user id's
export const blockedUsers: Collection<string, string> = new Collection();

export interface IBlocked extends Document {
   name: string,
   id: string
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
         return console.log(chalk.bgMagenta.bold('User already exists'))
      }
      console.log("adding blocked user")
      blockedUsers.set(id, name);
      return await new blockedModel({ name: name, id: id }).save();
   } catch (err) {
      console.error(err);
   }
}

export async function CacheBlockedList() {
   try {
      const blist = await blockedModel.find();
      blist.map(doc => blockedUsers.set(doc.id, doc.name));
   } catch (err) {
      console.error(err);
   }
}
