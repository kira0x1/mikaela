import { Document, model, Schema } from 'mongoose';
import { ISong } from '../../classes/Player';

export interface IUser extends Document {
   username: string;
   id: string;
   tag: string;
   favorites: ISong[];
}

export const UserSchema = new Schema({
   username: { type: String, required: true },
   id: { type: String, required: true },
   tag: { type: String, required: true },
   favorites: { type: Array<ISong>(), required: false },
   createdAt: Date
});

export const User = model<IUser>('users', UserSchema);