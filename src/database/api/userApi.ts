import { Message, User as DiscordUser } from 'discord.js';
import { logger } from '../../system';
import { Song } from '../../classes/Song';
import { quickEmbed } from '../../util/styleUtil';
import { IUser, User } from '../models/User';

export async function findUser(id: string): Promise<IUser> {
   try {
      const user = await User.findOne({ id: id });
      return user;
   } catch (error) {
      logger.error(error);
   }
}

export async function createUser(user: IUser | DiscordUser) {
   try {
      if (user instanceof DiscordUser) return await new User(converUserToIUser(user)).save();
      return await new User(user).save();
   } catch (error) {
      logger.error(error);
   }
}

export async function findOrCreate(user: DiscordUser) {
   let dbUser = await findUser(user.id);
   if (!dbUser) dbUser = await createUser(user);
   return dbUser;
}

function converUserToIUser(user: DiscordUser) {
   return {
      username: user.username,
      id: user.id,
      tag: user.tag,
      roles: [],
      favorites: []
   };
}

export async function addFavoriteToUser(member: DiscordUser, song: Song, message: Message) {
   const user = await findOrCreate(member);

   if (user.favorites?.find(fav => fav.id === song.id)) {
      quickEmbed(message, `Sorry **${user.username}** You already have this song as a favorite`);
      return;
   }

   quickEmbed(message, `**${user.username}** added song **${song.title}** to their favorites!`);

   user.favorites.push(song);
   return await user.save();
}
