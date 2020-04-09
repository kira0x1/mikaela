import { ICommand } from "../../classes/Command";
import { getTarget } from "../../util/FavoritesUtil";
import { getUser } from "../../db/userController";
import { QuickEmbed, embedColor } from "../../util/Style";
import { Collection, Message, User, RichEmbed, MessageReaction } from "discord.js";
import { ISource, IUser, ISourceGroup } from "../../db/dbUser";
import chalk from "chalk";

export const command: ICommand = {
   name: "List",
   description: "List Sources",
   isSubCommand: true,
   args: false,

   async execute(message, args) {
      let group = "";

      args.find((arg, i) => {
         if (arg && arg.startsWith("-") && arg.length > 1) {
            args.splice(i, 1);
            group = args.slice(i, 1).join(" ");
         }
      });

      const target = await getTarget(message, args.join(" "));

      if (target) {
         getUser(target.id)
            .then((user) => {
               console.log(`Found user: ${user.tag}`);
               if (user.sourcesGroups && user.sourcesGroups.length > 0) {
                  if (group === "") ListGroups(message, target, user);
                  else ListSources(message, target, user, group);
               } else {
                  QuickEmbed(message, `${target.username} doesn't have any sources`);
               }
            })
            .catch((err) => {
               QuickEmbed(message, `${target.username} doesn't have any sources`);
               console.log(err);
            });
      }
   },
};

async function ListSources(message: Message, target: User, user: IUser, group: string) {
   const groupFound = user.sourcesGroups.find((grp) => grp.name === group);
   if (!groupFound) return QuickEmbed(message, `Group **${group}** not found in **${target.username}'s** Source's`);

   const sources = groupFound.sources;

   const sourcesPerPage = 5;
   const pages: Collection<number, ISource[]> = new Collection();

   let count = 0;
   let pageAtInLoop = 0;
   pages.set(0, []);
   for (let i = 0; i < sources.length; i++) {
      if (count >= sourcesPerPage) {
         count = 0;
         pageAtInLoop++;
         pages.set(pageAtInLoop, []);
      }

      const pageSources = pages.get(pageAtInLoop);
      if (pageSources) {
         pageSources.push(sources[i]);
      } else {
         console.log(chalk.bgRed.bold("Page Sources undefined"));
      }

      count++;
   }

   let pageAt = 0;
   const embed = new RichEmbed();
   embed.setColor(embedColor);
   embed.setThumbnail(target.avatarURL);

   let title = `**${groupFound.name}**\nPage **${pageAt + 1}**`;
   title += `\nSources **${sources.length}**`;
   title += "\n\u200b";

   embed.setTitle(title);

   const page = pages.get(pageAt);
   if (page) {
      page.map((source, index) => {
         const num = `**${index + 1}**  `;

         let content = `URL: ${source.url}`;

         let title = `${num} `;
         if (source.title !== "") title += `  **${source.title}**`;

         embed.addField(title, content);
      });
   }

   const msg = await message.channel.send(embed);
   if (!(msg instanceof Message)) {
      return;
   }

   //If there are only 1 or none pages then dont add the next, previous page emojis / collector
   if (pages.size <= 1) return;

   msg.react("⬅").then(() => msg.react("➡"));

   const filter = (reaction: MessageReaction, user: User) => {
      return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
   };

   const collector = msg.createReactionCollector(filter);

   let currentPage = 0;

   collector.on("collect", async (r) => {
      if (r.emoji.name === "➡") {
         currentPage++;
         if (currentPage >= pages.size) currentPage = 0;
      } else if (r.emoji.name === "⬅") {
         currentPage--;
         if (currentPage < 0) currentPage = pages.size - 1;
      }

      r.remove(r.users.last());

      let title = `**${groupFound.name}**\nPage **${pageAt + 1}**`;
      title += `\nSources **${sources.length}**`;
      title += "\n\u200b";

      const newEmbed = new RichEmbed().setThumbnail(target.avatarURL).setTitle(title).setColor(embedColor);

      const page = pages.get(currentPage);
      if (!page) return;

      page.map((source, index) => {
         const num = `**${index + 1}**  `;

         let content = `URL: ${source.url}`;

         let title = `${num} `;
         if (source.title !== "") title += `  **${source.title}**`;

         embed.addField(title, content);
      });

      msg.edit(newEmbed);
   });
}

async function ListGroups(message: Message, target: User, user: IUser) {
   const sources = user.sourcesGroups;
   const sourcesPerPage = 5;
   const pages: Collection<number, ISourceGroup[]> = new Collection();

   let count = 0;
   let pageAtInLoop = 0;
   pages.set(0, []);
   for (let i = 0; i < sources.length; i++) {
      if (count >= sourcesPerPage) {
         count = 0;
         pageAtInLoop++;
         pages.set(pageAtInLoop, []);
      }

      const pageSources = pages.get(pageAtInLoop);
      if (pageSources) {
         pageSources.push(sources[i]);
      } else {
         console.log(chalk.bgRed.bold("Page Sources undefined"));
      }

      count++;
   }

   let pageAt = 0;
   const embed = new RichEmbed();
   embed.setColor(embedColor);
   embed.setThumbnail(target.avatarURL);

   let title = `**Sources**\nPage **${pageAt + 1}**`;
   title += `\nGroups **${user.sourcesGroups.length}**`;
   title += "\n\u200b";

   embed.setTitle(title);

   const page = pages.get(pageAt);
   if (page) {
      page.map((source, index) => {
         const num = `**${index + 1}**  `;

         let content = `Sources: ${source.sources.length}`;
         let title = `${num} **${source.name}**`;

         embed.addField(title, content);
      });
   }

   const msg = await message.channel.send(embed);
   if (!(msg instanceof Message)) {
      return;
   }

   //If there are only 1 or none pages then dont add the next, previous page emojis / collector
   if (pages.size <= 1) return;

   msg.react("⬅").then(() => msg.react("➡"));

   const filter = (reaction: MessageReaction, user: User) => {
      return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
   };

   const collector = msg.createReactionCollector(filter);

   let currentPage = 0;

   collector.on("collect", async (r) => {
      if (r.emoji.name === "➡") {
         currentPage++;
         if (currentPage >= pages.size) currentPage = 0;
      } else if (r.emoji.name === "⬅") {
         currentPage--;
         if (currentPage < 0) currentPage = pages.size - 1;
      }

      r.remove(r.users.last());

      let title = `**Sources**\nPage **${currentPage + 1}**`;
      title += `\nAmount **${user.sourcesGroups.length}**`;
      title += "\n\u200b";

      const newEmbed = new RichEmbed().setThumbnail(target.avatarURL).setTitle(title).setColor(embedColor);

      const page = pages.get(currentPage);
      if (!page) return;

      page.map((source, index) => {
         const num = `**${index + 1}**  `;

         let content = `Sources: ${source.sources.length}`;
         let title = `${num} **${source.name}**`;

         embed.addField(title, content);
      });

      msg.edit(newEmbed);
   });
}
