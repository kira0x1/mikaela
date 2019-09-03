import { Collection, GuildMember, Message, MessageReaction, RichEmbed, User } from "discord.js";
import { AddUserSong, GetUserSongs, RemoveSong } from "../db/dbFavorites";
import { ISong } from "../db/dbSong";
import { FindOrCreate, IUser, users } from "../db/dbUser";
import { Command, Flag } from "../objects/Command";
import { GetSong } from "../objects/song";
import { GetMessage } from "../util/MessageHandler";
import { embedColor, QuickEmbed } from "../util/Style";
import { player } from "./music";

const ms = require("ms");

const flags: Flag[] = [
  { name: "list", aliases: ["ls", "l"] },
  { name: "add", aliases: ["a"] },
  { name: "play", aliases: ["p"] },
  { name: "info", aliases: ["i"] },
  { name: "remove", aliases: ["r"] }
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
          ListFavorites(args);
          break;
        case "add":
          if (!args || (args && args.length === 0)) return QuickEmbed(`no songs given`);
          AddSong(args);
          break;

        case "info":
          if (!args || (args && args.length < 1)) return QuickEmbed(`no arguments given`);
          Info(args);
          break;
        case "play":
          if (!args || (args && args.length < 1)) return QuickEmbed(`no arguments given`);
          Play(message, args);
          break;
        case "remove":
          if (!args || (args && args.length < 1)) return QuickEmbed(`no arguments given`);
          Remove(args);
          break;
      }
    }

    message.channel.stopTyping(true);
  }
};

function Remove(args: string[]) {
  let songIndex = Number(args.shift());
  const favorites = GetUserSongs(GetMessage().author.id);
  songIndex--;

  if (!favorites || songIndex < 0 || songIndex > favorites.length) return QuickEmbed(`invalid song position`);
  RemoveSong(GetMessage().author.id, songIndex);
}

async function Play(message: Message, args: string[]) {
  if (args.length > 14) return QuickEmbed(`Too many arguments given`);

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

  if (songIndex === undefined) return QuickEmbed(`no song index given`);

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
    if (!userResult) return QuickEmbed(`user not found`);

    const fav = userResult.favorites;
    songIndex--;
    if (fav.length < songIndex) return QuickEmbed(`song not found`);

    const song = fav[songIndex];
    player.AddSong(song, message);
  }
}

async function Info(args: string[]) {
  if (args.length > 14) return QuickEmbed(`Too many arguments given`);

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

  if (songIndex === undefined) return QuickEmbed(`no song index given`);

  let user = undefined;
  const usersMentioned = GetMessage().mentions.members;
  if (usersMentioned && usersMentioned.size > 0) user = usersMentioned.first();

  if (!user) {
    let name = args.join(" ");
    const member = await GetMessage().guild.members.find(usr => usr.displayName.toLowerCase() === name.toLowerCase());

    if (member) user = member.user;
    else user = GetMessage().author;

    const userResult = users.get(user.id);
    if (!userResult) return QuickEmbed(`user not found`);

    const fav = userResult.favorites;
    songIndex--;

    if (!fav) return QuickEmbed(`no favorites`);
    if (fav.length < songIndex) return QuickEmbed(`song not found`);

    const song = fav[songIndex];
    let embed = new RichEmbed()
      .setTitle(song.title)
      .setDescription(song.duration.duration + `\n<${song.url}>`)
      .setColor(embedColor);

    GetMessage().channel.send(embed);
  }
}

async function AddSong(args: string[]) {
  const query = args.shift();
  if (!query) return;

  const song = await GetSong(query);

  if (!song) return QuickEmbed("song not found");
  const author = GetMessage().author;
  const user: IUser = {
    nickname: author.username,
    tag: author.tag,
    id: author.id
  };
  FindOrCreate(user);
  AddUserSong({ tag: user.tag, id: user.id, nickname: user.nickname }, song);
}

async function ListFavorites(args: string[]) {
  const maxSongs: number = 5;
  const target = await getTarget(args.join(" "));
  const fav = GetUserSongs(target.id);
  const pages: Collection<number, ISong[]> = new Collection();

  if (!fav || !fav.length) {
    GetMessage().channel.stopTyping(true);
    return QuickEmbed(`no favorites`);
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

  const msgTemp = await GetMessage().channel.send(embed);

  if (pages.size <= 1) return GetMessage().channel.stopTyping(true);

  let msg: undefined | Message = undefined;
  if (!Array.isArray(msgTemp)) msg = msgTemp;

  if (!msg) return GetMessage().channel.stopTyping(true);
  msg.react("⬅").then(() => msg.react("➡"));

  const filter = (reaction: MessageReaction, user: User) => {
    return (reaction.emoji.name === "➡" || reaction.emoji.name === "⬅") && !user.bot;
  };

  const collector = msg.createReactionCollector(filter, { time: ms("15m") });
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

export async function getTarget(userName: string) {
  const msg = GetMessage();
  let user: undefined | User = undefined;

  var userName = userName.toLowerCase();

  if (!userName) {
    let member = await msg.guild.fetchMember(msg.author);
    user = member.user;
  } else {
    if (msg.mentions.users.size > 0) user = msg.mentions.members.first().user;
    else {
      let member = await msg.guild.members.find(m => m.displayName.toLowerCase() === userName);

      if (member) user = member.user;
    }
  }

  if (!user) {
    let member = await msg.guild.fetchMember(msg.author);
    user = member.user;
  }

  FindOrCreate({ tag: user.tag, id: user.id, nickname: user.username });
  return user;
}
