import chalk from "chalk";
import { Collection, Message, MessageReaction, RichEmbed, User } from "discord.js";
import { ICommand } from "../../classes/Command";
import { ISong } from "../../classes/Player";
import { IUser } from "../../db/dbUser";
import { getUser } from "../../db/userController";
import { getTarget } from "../../util/FavoritesUtil";
import { embedColor, QuickEmbed } from "../../util/Style";

export const command: ICommand = {
  name: "list",
  description: "Lists your favorites or someone elses",
  usage: "[empty | user]",
  isSubCommand: true,

  async execute(message, args) {
    const target = await getTarget(message, args.join(" "));

    if (target) {
      getUser(target.id)
        .then(user => {
          console.log(`Found user: ${user.tag}`);
          if (user.favorites) {
            ListFavorites(message, target, user);
          } else {
            QuickEmbed(message, "You dont have any favorites");
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};

async function ListFavorites(message: Message, target: User, user: IUser) {
  const songs = user.favorites;
  const songsPerPage = 5;
  const pages: Collection<number, ISong[]> = new Collection();

  let count = 0;
  let pageAtInLoop = 0;
  pages.set(0, []);
  for (let i = 0; i < songs.length; i++) {
    if (count >= songsPerPage) {
      count = 0;
      pageAtInLoop++;
      pages.set(pageAtInLoop, []);
    }

    const pageSongs = pages.get(pageAtInLoop);
    if (pageSongs) {
      pageSongs.push(songs[i]);
    } else {
      console.log(chalk.bgRed.bold("Page Songs undefined"));
    }

    count++;
  }

  let pageAt = 0;
  const embed = new RichEmbed();
  embed.setColor(embedColor);
  embed.setThumbnail(target.avatarURL);

  let title = `**Favorites**\nPage **${pageAt + 1}**`;
  title += `\nSongs **${user.favorites.length}**`;
  title += "\n\u200b";

  embed.setTitle(title);

  const page = pages.get(pageAt);
  if (page) {
    page.map((song, index) => {
      const num = `**${index + 1}**  `;
      let content = "Duration: " + song.duration.duration;
      content += `  ${song.url}`;

      let title = num + " " + `**${song.title}**`;
      embed.addField(title, content);
    });
  }

  const msg = await message.channel.send(embed);
  if (!(msg instanceof Message)) {
    return;
  }

  msg.react("⬅").then(() => msg.react("➡"));

  const filter = (reaction: MessageReaction, user: User) => {
    return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
  };

  const collector = msg.createReactionCollector(filter);

  let currentPage = 0;

  collector.on("collect", async r => {
    if (r.emoji.name === "➡") {
      currentPage++;
      if (currentPage >= pages.size) currentPage = 0;
    } else if (r.emoji.name === "⬅") {
      currentPage--;
      if (currentPage < 0) currentPage = pages.size - 1;
    }

    r.remove(r.users.last());

    let title = `**Favorites**\nPage **${currentPage + 1}**`;
    title += `\nSongs **${user.favorites.length}**`;
    title += "\n\u200b";

    const newEmbed = new RichEmbed()
      .setThumbnail(target.avatarURL)
      .setTitle(title)
      .setColor(embedColor);

    const page = pages.get(currentPage);
    if (!page) return;

    page.map((song, index) => {
      const num = `**${currentPage * 5 + (index + 1)}**`;
      let content = "Duration: " + song.duration.duration;
      content += `  ${song.url}`;

      let title = num + " " + `**${song.title}**`;
      newEmbed.addField(title, content);
    });

    msg.edit(newEmbed);
  });
}
