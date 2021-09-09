import { Document, model, Schema } from 'mongoose';
import { Song } from '../../classes/Song';

export interface IUser extends Document {
   username: string;
   id: string;
   tag: string;
   favorites: Song[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserSchema = new Schema({
   username: { type: String, required: true },
   id: { type: String, required: true },
   tag: { type: String, required: true },
   favorites: { type: Array<Song>(), required: false },
   createdAt: { type: Date, default: Date.now() }
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const User = model<IUser>('users', UserSchema);
