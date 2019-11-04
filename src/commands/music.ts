import { Message, RichEmbed } from 'discord.js';
import { prefix } from "../config";
import { Command } from "../objects/command";
import { Player } from "../objects/song";
import { embedColor, QuickEmbed } from "../util/Style";

const subcmd: Command[] = [
  {
    name: "stop",
    aliases: ["quit", "end", "leave"],
    execute() {
      player.Stop();
    }
  },
  {
    name: "skip",
    aliases: ["next", "fs"],
    execute(message: Message) {
      player.Skip(message);
    }
  },
  {
    name: "remove",
    aliases: ["rem", "cancel"],
    execute(message, args: string[]) {
      if (args) {
        let pos = args.shift();
        if (Number(pos)) player.RemoveSong(message, Number(pos));
      }
    }
  },
  {
    name: "list",
    aliases: ["q", "ls"],
    execute(message, args) {
      player.ListQueue(message);
    }
  },
  {
    name: "current",
    aliases: ["np", "c"],
    execute(message, args) {
      const currentSong = player.queue.currentSong;
      if (!currentSong) return QuickEmbed(message, `No song currently playing`);

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

  execute(message, args) {
    let query = args.join();
    if (query === "") return QuickEmbed(message, `${prefix}${this.usage}`);
    player.AddSong(query, message);
  }
};

export function playerInit() {
  player = new Player();
}
