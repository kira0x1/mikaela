import { model, Schema } from 'mongoose';

//A list of user id's
export var blockedUsers: string[] = [];

export const BlockedListSchema = new Schema({
   id: { type: String, required: true },
   createdAt: Date
});

export const blockedModel = model('blockedUsers', BlockedListSchema);

export async function AddBlocked(id: string) {
   try {
      blockedUsers.push(id);
      return await blockedModel.create({ id: id });
   } catch (err) {
      console.error(err);
   }
}

export async function CacheBlockedList() {
   try {
      blockedUsers = [];
      const blist = await blockedModel.find();
      blist.map(doc => blockedUsers.push(doc.id));
   } catch (err) {
      console.error(err);
   }
}
