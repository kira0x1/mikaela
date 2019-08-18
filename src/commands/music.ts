import { RichEmbed } from "discord.js";
import { Command } from "../objects/command";
import { embedColor, QuickEmbed } from "../util/Style";
import { Player } from "../objects/song";
import { prefix } from "../config";

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
    execute() {
      player.Skip();
    }
  },
  {
    name: "remove",
    aliases: ["rem", "cancel"],
    execute(message, args: string[]) {
      if (args) {
        let pos = args.shift();
        if (Number(pos)) player.RemoveSong(Number(pos));
      }
    }
  },
  {
    name: "list",
    aliases: ["q", "ls"],
    execute() {
      player.ListQueue();
    }
  },
  {
    name: "current",
    aliases: ["np", "c"],
    execute(message, args) {
      const currentSong = player.queue.currentSong;
      if (!currentSong) return QuickEmbed(`No song currently playing`);

      let embed = new RichEmbed()
        .setTitle(`currently playing **${currentSong.title}**`)
        .setDescription(currentSong.duration.duration)
        .setColor(embedColor);

      message.channel.send(embed);
    }
  }
  // {
  //   name: "volume increase",
  //   aliases: ["+", "inc"],
  //   wip: true,
  //   execute(message, args) {
  //     const amount = args.shift();
  //   }
  // }
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
    if (query === "") return QuickEmbed(`${prefix}${this.usage}`);
    player.Play(query, message);
  }
};

export function playerInit() {
  player = new Player();
}
