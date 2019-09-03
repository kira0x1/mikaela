import { RichEmbed, Message } from "discord.js";
import { Command } from "../objects/command";
import { embedColor, QuickEmbed } from "../util/Style";
import { Player } from "../objects/song";
import { prefix } from "../config";

const subcmd: Command[] = [
  {
    name: "stop",
    aliases: ["quit", "end", "leave"],
    async execute() {
      player.Stop();
    }
  },
  {
    name: "skip",
    aliases: ["next", "fs"],
    async execute() {
      player.Skip();
    }
  },
  {
    name: "remove",
    aliases: ["rem", "cancel"],
    async execute(message, args: string[]) {
      if (args) {
        let pos = args.shift();
        if (Number(pos)) player.RemoveSong(Number(pos));
      }
    }
  },
  {
    name: "list",
    aliases: ["q", "ls"],
    async execute(message: Message) {
      player.ListQueue(message);
    }
  },
  {
    name: "current",
    aliases: ["np", "c"],
    async execute(message, args) {
      const currentSong = player.queue.currentSong;
      if (!currentSong) return QuickEmbed(`No song currently playing`);

      let embed = new RichEmbed()
        .setTitle(`currently playing **${currentSong.title}**`)
        .setDescription(currentSong.duration.duration)
        .setColor(embedColor);

      message.channel.send(embed);
    }
  }
];

export var player = new Player();
export const command: Command = {
  name: "music",
  description: "Plays music",
  aliases: ["p", "play"],
  args: false,
  usage: "[Search | Link]",
  subCmd: subcmd,

  async execute(message, args) {
    let query = args.join();
    if (query === "") return QuickEmbed(`${prefix}${this.usage}`);
    player.AddSong(query, message);
  }
};

export function playerInit() {
  player = new Player();
}
