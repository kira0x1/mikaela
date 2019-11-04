import { Collection, GuildMember, Message, MessageReaction, RichEmbed, User } from "discord.js";
import { AddUserSong, GetUserSongs, RemoveSong } from "../db/dbFavorites";
import { ISong } from "../db/dbSong";
import { FindOrCreate, IUser, users } from "../db/dbUser";
import { Command, Flag } from "../objects/Command";
import { GetSong } from "../objects/song";
import { embedColor, QuickEmbed } from "../util/Style";
import { player } from "./music";

const ms = require("ms");

const flags: Flag[] = [
  { name: "list", aliases: ["ls", "l"] },
  { name: "add", aliases: ["a"] },
  { name: "play", aliases: ["p"] },
  { name: "info", aliases: ["i"] },
  { name: "remove", aliases: ["r"] },
  { name: "shuffle", aliases: ["sf", "random", "r", "rand", "mix"] }
];

export const command: Command = {
  name: "favorite",
  description: "Favorite songs",
  aliases: ["fav", "f"],
  flags: flags,
  cooldown: 3,

  async execute(message, args) {
    message.channel.startTyping();
    let msg: string = args.shift() || "";
    if (msg === "") return;

    let flag = flags.find(f => f.name === msg || (f.aliases && f.aliases.includes(msg)));

    if (flag) {
      switch (flag.name) {
        case "list":
          ListFavorites(message, args);
          break;
        case "add":
          if (!args || (args && args.length === 0)) return QuickEmbed(message, `no songs given`);
          AddSong(message, args);
          break;

        case "info":
          if (!args || (args && args.length < 1)) return QuickEmbed(message, `no arguments given`);
          Info(message, args);
          break;
        case "play":
          if (!args || (args && args.length < 1)) return QuickEmbed(message, `no arguments given`);
          Play(message, args);
          break;
        case "remove":
          if (!args || (args && args.length < 1)) return QuickEmbed(message, `no arguments given`);
          Remove(message, args);
          break;
        case "shuffle":
          Shuffle(message, args)
          break;
      }
    }

    message.channel.stopTyping(true);
  }
};

function Remove(message: Message, args: string[]) {
  let songIndex = Number(args.shift());
  const favorites = GetUserSongs(message.author.id);
  songIndex--;

  if (!favorites || songIndex < 0 || songIndex > favorites.length) return QuickEmbed(message, `invalid song position`);
  RemoveSong(message, message.author.id, songIndex);
}

async function Play(message: Message, args: string[]) {
  if (args.length > 14) return QuickEmbed(message, `Too many arguments given`);

  let songIndex: number | undefined = undefined;
  if (args.length === 1) songIndex = Number(args.shift());
  else
    args.find((arg, pos) => {
      if (Number(arg)) {
        songIndex = Number(arg);
        args.splice(pos, 1);
        return;
      }
    });

  if (songIndex === undefined) return QuickEmbed(message, `no song index given`);

  let user = undefined;
  const usersMentioned = message.mentions.members;
  if (usersMentioned && usersMentioned.size > 0) user = usersMentioned.first();

  if (!user) {
    let userName = args.join();
    // / message.guild.members.find(usr => usr.displayName.toLowerCase() === displayName.toLowerCase())
    let user: GuildMember | User = await message.channel.guild.members.find(
      usr => usr.displayName.toLowerCase() === userName.toLowerCase()
    );

    if (!user) {
      user = message.author;
    }

    const userResult = users.get(user.id);
    if (!userResult) return QuickEmbed(message, `user not found`);

    const fav = userResult.favorites;
    songIndex--;
    if (fav.length < songIndex) return QuickEmbed(message, `song not found`);

    const song = fav[songIndex];
    player.AddSong(song, message);
  }
}



async function Info(message: Message, args: string[]) {
  if (args.length > 14) return QuickEmbed(message, `Too many arguments given`);

  let songIndex: number | undefined = undefined;

  if (args.length === 1) songIndex = Number(args.shift());
  else
    args.find((arg, pos) => {
      if (Number(arg)) {
        songIndex = Number(arg);
        args.splice(pos, 1);
        return;
      }
    });

  if (songIndex === undefined) return QuickEmbed(message, `no song index given`);

  let user = undefined;
  const usersMentioned = message.mentions.members;
  if (usersMentioned && usersMentioned.size > 0) user = usersMentioned.first();

  if (!user) {
    let name = args.join(" ");
    const member = await message.guild.members.find(usr => usr.displayName.toLowerCase() === name.toLowerCase());

    if (member) user = member.user;
    else user = message.author;

    const userResult = users.get(user.id);
    if (!userResult) return QuickEmbed(message, `user not found`);

    const fav = userResult.favorites;
    songIndex--;

    if (!fav) return QuickEmbed(message, `no favorites`);
    if (fav.length < songIndex) return QuickEmbed(message, `song not found`);

    const song = fav[songIndex];
    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(song.duration.duration + `\n<${song.url}>`)
      .setColor(embedColor);

    message.channel.send(embed);
  }
}

async function AddSong(message: Message, args: string[]) {
  const query = args.shift();
  if (!query) return;

  const song = await GetSong(query);

  if (!song) return QuickEmbed(message, "song not found");
  const author = message.author;
  const user: IUser = {
    nickname: author.username,
    tag: author.tag,
    id: author.id
  };
  FindOrCreate(user);
  AddUserSong(message, { tag: user.tag, id: user.id, nickname: user.nickname }, song);
}

async function Shuffle(message: Message, args: string[]) {
  if (args.length > 14) return QuickEmbed(message, `Too many arguments given`);
  let shuffleAmount: number | undefined = undefined;

  if (args.length === 1) {
    if (Number(args[0]))
      shuffleAmount = Number(args.shift());
  }
  else {
    args.find((arg, pos) => {
      if (Number(arg)) {
        shuffleAmount = Number(arg);
        args.splice(pos, 1);
        return;
      }
    });
  }

  const target = await getTarget(message, args.join(" "))

  if (!target) return QuickEmbed(message, "User not found")

  const fav = GetUserSongs(target.id)

  if (!fav || !fav.length) {
    message.channel.stopTyping(true)
    return QuickEmbed(message, `no favorites`);
  }


  const embed = new RichEmbed()
    .setTitle(`Shuffling from user ${target.username}`)
    .setThumbnail(target.avatarURL)
    .setDescription(`Shuffling ${shuffleAmount || 1} songs`)
    .setColor(embedColor)

  message.channel.send(embed)

  //Play one song manually before entering loop
  let firstSong = PickSong(fav.length)
  player.AddSong(fav[firstSong], message)

  let songsPicked = []

  let i = 0
  while (i < shuffleAmount) {
    let songPos = PickSong(fav.length)
    if (songsPicked.includes(songPos)) {
      songPos = PickSong(fav.length)
    }
    else {
      songsPicked.push(songPos)
      await player.AddSong(fav[songPos], message)
      i++;
    }
  }
}

function PickSong(shuffleAmount) {
  return Math.floor(Math.random() * shuffleAmount)
}

async function ListFavorites(message: Message, args: string[]) {
  const maxSongs: number = 5;
  const target = await getTarget(message, args.join(" "));
  const fav = GetUserSongs(target.id);
  const pages: Collection<number, ISong[]> = new Collection();

  if (!fav || !fav.length) {
    message.channel.stopTyping(true);
    return QuickEmbed(message, `no favorites`);
  }

  let currentPage: number = 0;
  let songsInPage = 0;

  let embed = new RichEmbed();

  for (let i = 0; i < fav.length; i++) {
    const song: ISong = fav[i];
    if (!pages.get(currentPage)) {
      pages.set(currentPage, []);
    }

    pages.get(currentPage).push(song);
    songsInPage++;

    if (songsInPage >= maxSongs) {
      songsInPage = 0;
      currentPage++;
    }
  }

  currentPage = 0;
  if (pages.get(currentPage) === undefined || pages === undefined || currentPage === undefined) return;

  embed
    .setThumbnail(target.avatarURL)
    .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${fav.length}**`, "\u200b")
    .setColor(embedColor);

  pages
    .get(currentPage)
    .map((s, pos) => embed.addField(`**${pos + 1}\t${s.title}**`, "Duration: " + s.duration.duration));

  const msgTemp = await message.channel.send(embed);

  if (pages.size <= 1) return message.channel.stopTyping(true);

  let msg: undefined | Message = undefined;
  if (!Array.isArray(msgTemp)) msg = msgTemp;

  if (!msg) return message.channel.stopTyping(true);
  msg.react("⬅").then(() => msg.react("➡"));

  const filter = (reaction: MessageReaction, user: User) => {
    return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
  };

  const collector = msg.createReactionCollector(filter, { time: ms("2h") });

  collector.on("collect", async r => {
    if (r.emoji.name === "➡") {
      currentPage++;
      if (currentPage >= pages.size) currentPage = 0;
    } else if (r.emoji.name === "⬅") {
      currentPage--;
      if (currentPage < 0) currentPage = pages.size - 1;
    }

    r.remove(r.users.last());

    const newEmbed = new RichEmbed()
      .setThumbnail(target.avatarURL)
      .addField(`\n\n***Favorites***\nPage **${currentPage + 1}**\nTotal Songs **${fav.length}**`, "\u200b")
      .setColor(embedColor);

    pages
      .get(currentPage)
      .map((s, pos) =>
        newEmbed.addField(`**${pos + 1 + currentPage * maxSongs}\t${s.title}**`, "Duration: " + s.duration.duration)
      );
    msg.edit(newEmbed);
  });
}

export async function getTarget(message: Message, userName: string) {
  let user: undefined | User = undefined;

  var userName = userName.toLowerCase();

  if (!userName) {
    let member = await message.guild.fetchMember(message.author);
    user = member.user;
  } else {
    if (message.mentions.users.size > 0) user = message.mentions.members.first().user;
    else {
      let member = await message.guild.members.find(m => m.displayName.toLowerCase() === userName);

      if (member) user = member.user;
    }
  }

  if (!user) {
    let member = await message.guild.fetchMember(message.author);
    user = member.user;
  }

  FindOrCreate({ tag: user.tag, id: user.id, nickname: user.username });
  return user;
}
