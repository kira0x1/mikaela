import { Client, Collection, GuildMember, User } from 'discord.js';
import { model, Schema } from 'mongoose';
import { ISong } from '../classes/Player';
import { conn } from './database';
import { addUser } from './userController';

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

export interface IUser {
   username: string;
   id: string;
   tag: string;
   roles: IRole[];
   favorites: ISong[];
   sourcesGroups: ISourceGroup[];
}

export const UserSchema = new Schema({
   username: { type: String, required: true },
   id: { type: String, required: true },
   tag: { type: String, required: true },
   roles: { type: [{ name: String, id: String }], required: true },
   favorites: { type: Array<ISong>(), required: false },
   sourcesGroups: { type: Array<ISourceGroup>(), required: false },
   createdAt: Date,
});

export const userModel = model('users', UserSchema);

//Create a UserModel and insert it into the database, returns an error if the user already exists
export function CreateUser(user: IUser | GuildMember) {
   var usersModel = conn.model('users', UserSchema);

   if (user instanceof GuildMember) {
      const memberUser: IUser = {
         username: user.user.username,
         tag: user.user.tag,
         id: user.id,
         favorites: [],
         roles: [],
         sourcesGroups: [],
      };
      return addUser(memberUser);
   } else {
      return addUser(user);
   }
}
