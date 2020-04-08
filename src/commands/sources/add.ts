import { ICommand } from "../../classes/Command";
import { getUser, updateUser } from "../../db/userController";
import chalk from "chalk";
import { CreateUser, IUser } from "../../db/dbUser";
import { Message } from "discord.js";
import { QuickEmbed } from "../../util/Style";

export const command: ICommand = {
   name: "Add",
   description: "Add a source to your sources list",
   usage: "[url] [title]",
   args: true,
   isSubCommand: true,

   async execute(message, args) {
      let title: string = "";
      let group: string = "";

      args.find((arg, i) => {
         if (arg && arg.startsWith("-") && arg.length > 1 && arg[i + 1] !== "-") {
            if (arg === "-title" || arg === "-name") {
               args.splice(i, 1);
               title = args.splice(i, 1).join(" ");
               console.log(chalk.bgRed.bold(`Name argument given: ${title}`));
            } else if (arg === "-group" || arg === "-grp") {
               args.splice(i, 1);
               group = args.splice(i, 1).join(" ");
               console.log(chalk.bgRed.bold(`Group argument given: ${group}`));
            }
         }
      });

      const query = args.join(" ");
      console.log(`query: ${query}`);

      getUser(message.member.user.id)
         .then((user) => {
            AddSource(message, user, query, title, group);
         })
         .catch(async (err) => {
            //If user was not found create them
            await CreateUser(message.member);

            //Add favorite to the newly created user
            getUser(message.member.user.id)
               .then((user) => {
                  AddSource(message, user, query, title, group);
               })
               .catch((err) => {
                  console.log(err);
               });
         });
   },
};

async function AddSource(message: Message, user: IUser, query: string, title: string = "", group: string = "") {
   if (!user) return QuickEmbed(message, `Error finding user`);
   if (group !== "") {
      const groupFound = user.sourcesGroups.find((grp) => grp.name === group);
      if (!groupFound) user.sourcesGroups.push({ name: group, sources: [] });
      user.sourcesGroups.find((grp) => {
         if (grp.name === group) {
            grp.sources.push({ title: title, url: query, group: group });
         }
      });
   }
   updateUser(message.member.id, user);
}
