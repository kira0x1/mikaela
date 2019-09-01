import { Schema } from "mongoose";
import { QuickEmbed } from "../util/Style";
import { conn } from "./dbSetup";
import { ISong } from "./dbSong";
import { FindOrCreate, IUser, users } from "./dbUser";

export const UserSongSchema = new Schema({
  userId: { type: String, unique: false, required: true },
  song: {
    id: String,
    title: String,
    url: String,
    duration: {
      seconds: String,
      minutes: String,
      hours: String,
      duration: String
    }
  },
  created: {
    type: Date,
    default: Date.now()
  }
});

export function GetUserSongs(userId: string) {
  const user = users.get(userId);
  if (!user) return undefined;
  return user.favorites;
}

export async function FindSong(userId: string, songId: string) {
  return await users.get(userId).favorites.find(song => song.id === songId);
}

export async function AddUserSong(user: IUser, song: ISong) {
  //Make sure user exists
  await FindOrCreate(user);
  let usersSongs = await GetUserSongs(user.id);

  if (usersSongs.length > 0) {
    const songFound = await usersSongs.find(s => s.id === song.id);

    if (songFound) {
      QuickEmbed(`you already have this song as a favorite`);
      return;
    }
  }

  QuickEmbed(
    `**${user.tag}** Added song ***${song.title}*** to their favorites`
  );
  var userSongsModel = await conn.model("userSongs", UserSongSchema);
  users.get(user.id).AddSongToFavorites(song);
  userSongsModel.create({
    userId: user.id,
    song: {
      id: song.id,
      title: song.title,
      url: song.url,
      duration: song.duration
    }
  });
}

export async function RemoveSong(userId: string, songIndex: number) {
  var userSongsModel = await conn.model("userSongs", UserSongSchema);
  const user = users.get(userId);
  if (!user) return QuickEmbed(`You have no favorites to remove`);
  const song = user.favorites[songIndex];
  if (!song) return QuickEmbed(`Couldnt find a song at that position`);

  await userSongsModel.deleteOne({ userId: userId, songId: song.id });
  users.get(userId).favorites.splice(songIndex, 1);
}

export async function initUserSongs() {
  var userSongsModel = await conn.model("userSongs", UserSongSchema);
  let usr = users.array();

  for (let i = 0; i < usr.length; i++) {
    const usongs = await userSongsModel.find({ userId: usr[i].id });
    await usongs.map(doc => {
      let s = doc.toObject();
      usr[i].favorites.push(s.song);
    });
  }
}
