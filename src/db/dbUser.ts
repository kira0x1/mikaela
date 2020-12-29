import { Collection } from 'discord.js';
import { Document, model, Schema } from 'mongoose';
import { ISong } from '../classes/Player';

export var users: Collection<string, IUser> = new Collection();

export interface IRole {
   name: string;
   id: string;
}

export interface ISource {
   title: string;
   url: string;
   group: string;
}

export interface ISourceGroup {
   name: string;
   sources: Array<ISource>;
}

export interface IUserSources {
   groups: Array<ISourceGroup>;
   sources: Array<ISource>;
}

export interface IUser extends Document {
   username: string;
   id: string;
   tag: string;
   roles: IRole[];
   favorites: ISong[];
}

export const UserSchema = new Schema({
   username: { type: String, required: true },
   id: { type: String, required: true },
   tag: { type: String, required: true },
   roles: { type: [{ name: String, id: String }], required: true },
   favorites: { type: Array<ISong>(), required: false },
   createdAt: Date
});

export const User = model<IUser>('users', UserSchema);