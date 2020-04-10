import { ICommand } from '../../classes/Command';
import { getUser, updateUser } from '../../db/userController';
import chalk from 'chalk';
import { CreateUser, IUser } from '../../db/dbUser';
import { Message } from 'discord.js';
import { QuickEmbed } from '../../util/Style';

export const command: ICommand = {
   name: 'Add',
   description: 'Add a source to your sources list',
   usage: '[url] [title]',
   args: true,
   isSubCommand: true,

   async execute(message, args) {
      let title: string = '';
      let group: string = '';

      args.find((arg, i) => {
         if (arg)
            if (arg.toLowerCase() === '-group' || arg === '-grp' || arg === '-g') {
               group = args.splice(i + 1, 1).join(' ');
               args.splice(i, 1);
            }
      });

      args.find((arg, i) => {
         if (arg)
            if (arg.toLowerCase() === '-title' || arg === '-name') {
               title = args.splice(i + 1, 1).join(' ');
               args.splice(i, 1);
            }
      });

      const query = args.join(' ');

      getUser(message.member.user.id)
         .then((user) => {
            AddSource(message, user, query, title, group);
         })
         .catch(async (err) => {
            const member = message.member;

            //If user was not found create them
            await CreateUser(member);

            //Add favorite to the newly created user
            getUser(member.id)
               .then((user) => {
                  AddSource(message, user, query, title, group);
               })
               .catch((err) => {
                  console.log(chalk.bgRed.bold(`Error While adding Sources, LINE: 43 , add.ts`));
                  console.log(err);
               });
         });
   },
};

async function AddSource(message: Message, user: IUser, query: string, title: string = '', group: string = '') {
   if (!user) return QuickEmbed(message, `Error finding user`);

   //If no group specified then set it the ungrouped group
   if (group === '') {
      group = 'Ungrouped';
   }

   //Get the Sources Group
   const groupFound = user.sourcesGroups.find((grp) => grp.name === group);

   //Create a group if the one specified doesnt exist
   if (!groupFound) user.sourcesGroups.push({ name: group, sources: [] });

   //! Insert the Source to the Group
   user.sourcesGroups.find((grp) => {
      if (grp.name === group) {
         grp.sources.push({ title: title, url: query, group: group });
      }
   });

   //? Create the feedback text
   let replyMessage = 'Added source ';
   if (title !== '') replyMessage += `"***${title}***" `;
   replyMessage += `*${query}* to group *"${group}"*`;

   //Send Feedback to the user
   QuickEmbed(message, replyMessage);

   //Update the user on the database
   updateUser(message.member.id, user);
}
