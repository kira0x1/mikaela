import { ICommand } from '../../classes/Command';
import { getUser, updateUser } from '../../db/userController';
import { getSong } from '../../util/Api';
import { QuickEmbed } from '../../util/Style';
import { Message } from 'discord.js';
import { IUser, CreateUser } from '../../db/dbUser';
import { ISong } from '../../classes/Player';

export const command: ICommand = {
   name: 'add',
   description: 'Add a song to your favorites',
   usage: '[search | url]',
   args: true,

   async execute(message, args) {
      const query = args.join();

      const song = await getSong(query);
      if (!song) return QuickEmbed(message, 'song not found');

      getUser(message.member.user.id)
         .then(user => AddFavorite(user, song, message))
         .catch(async err => {
            //If user was not found create them
            await CreateUser(message.member);

            //Add favorite to the newly created user
            getUser(message.member.user.id)
               .then(user => {
                  AddFavorite(user, song, message);
               })
               .catch(err => {
                  console.log(err);
               });
         });

      //If user was not found create them
      await CreateUser(message.member);

      //Add favorite to the newly created user
      getUser(message.member.user.id)
         .then(user => {
            AddFavorite(user, song, message);
         })
         .catch(err => {
            console.log(err);
         });
   },
};

export function AddFavorite(user: IUser, song: ISong, message: Message) {
   if (user.favorites && user.favorites.find(fav => fav.id === song.id)) {
      return QuickEmbed(message, `Sorry **${user.username}** You already have this song as a favorite`);
   } else {
      QuickEmbed(message, `**${user.username}** added song **${song.title}** to their favorites!`);
      user.favorites.push(song);
      updateUser(message.member.user.id, user);
   }
}
