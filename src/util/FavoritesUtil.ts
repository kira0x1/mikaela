import { Message, User } from 'discord.js';
import { addUser, getUser } from '../db/userController';

export async function getTarget(message: Message, username: string) {
   let user: undefined | User = undefined;
   let userName = username.toLowerCase();

   if (!userName) {
      let member = await message.guild.fetchMember(message.author);
      user = member.user;
   } else {
      if (message.mentions.users.size > 0) user = message.mentions.members.first().user;
      else {
         let member = message.guild.members.find((m) => m.displayName.toLowerCase() === userName);
         if (member) user = member.user;
      }
   }

   if (!user) {
      let member = await message.guild.fetchMember(message.author);
      user = member.user;
   }

   let userDb = await getUser(user.id)
      .then(() => {})
      .catch((err) => {
         if (!user) return console.log(`user undefined`);
         addUser({
            tag: user.tag,
            username: user.username,
            favorites: [],
            id: user.id,
            roles: [],
            sourcesGroups: [],
         })
            .then((user) => {})
            .catch((err) => console.log(err));
      });

   return user;
}
