import { Collection } from "discord.js";
import { model, Schema } from "mongoose";

import { conn } from "./dbSetup";
import { CreateSong, ISong } from "./dbSong";

export const users: Collection<string, User> = new Collection();

//Setup users interface
export interface IUser {
  tag: string;
  id: string;
  nickname: string;
}

//Setup users schema
export const UserSchema = new Schema({
  tag: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  nickname: { type: String, required: false, unique: false },
  created: { type: Date, default: Date.now() }
});

//Create or Get the users model (table)
const UserModel = model("users", UserSchema);

export async function initUsers() {
  var userModel = await conn.model("users", UserSchema);
  const usersFound = await userModel.find();

  usersFound.map(async doc => {
    const userJson = doc.toObject();
    const user: User = new User(userJson.tag, userJson.nickname, userJson.id, []);
    users.set(user.id, user);
  });
}

export async function FindOrCreate(user: IUser) {
  let userFound = users.get(user.id);

  if (!userFound) await CreateUser(user.tag, user.id, user.nickname);

  return users.get(user.id);
}

//Find a user by their tag
export async function FindUser(tag: string) {
  return new Promise<IUser>(async function(resolve, reject) {
    await UserModel.collection.findOne({ tag: tag }, function(err, usr) {
      if (err || !usr) {
        return reject(undefined);
      }

      return resolve(usr);
    });
  });
}

//Create a UserModel and insert it into the database, returns an error if the user already exists
export async function CreateUser(tag: string, id: string, nickname: string) {
  var usersModel = await conn.model("users", UserSchema);
  console.log(`creating user: ${tag}`);
  usersModel.create({ tag: tag, id: id, nickname: nickname });
  users.set(id, new User(tag, nickname, id, []));
}

export class User {
  tag: string;
  nickname: string;
  id: string;
  favorites: ISong[];

  constructor(tag: string, nickname: string, id: string, favorites: ISong[]) {
    this.tag = tag;
    this.nickname = nickname;
    this.id = id;
    this.favorites = favorites;
  }

  public AddSongToFavorites(song: ISong) {
    this.favorites.push(song);
    CreateSong(song.title, song.id, song.url, song.duration);
  }
}

export async function debugUsers() {
  users.map(usr => {
    console.log(`user favorites`);
    usr.favorites.map(fav => {
      console.dir(fav);
    });
  });
}
