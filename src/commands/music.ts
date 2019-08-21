import { RichEmbed, Collection } from 'discord.js';
import { prefix } from '../config';
import { Command } from '../objects/command';
import { Player } from '../objects/playerOld';
import { embedColor, QuickEmbed } from '../util/Style';

const subcmd: Array<Command> = [
  {
    name: "stop",
    aliases: ["quit", "end", "leave"],
    execute(message, args) {
      const guildId = message.guild.id
      let player = players.get(guildId)

      if (!player) {
        players.set(guildId, new Player())
        player = players.get(guildId)
      }

      player.Stop()
    }
  },
  {
    name: "skip",
    aliases: ["next", "fs"],
    execute(message, args) {
      const guildId = message.guild.id
      let player = players.get(guildId)

      if (!player) {
        players.set(guildId, new Player())
        player = players.get(guildId)
      }

      player.Skip()
    }
  },
  {
    name: "remove",
    aliases: ["rem", "cancel"],
    execute(message, args: string[]) {
      const guildId = message.guild.id
      let player = players.get(guildId)

      if (!player) {
        players.set(guildId, new Player())
        player = players.get(guildId)
      }

      if (args) {
        let pos = args.shift()
        if (Number(pos)) player.RemoveSong(Number(pos))
      }
    }
  },
  {
    name: "list",
    aliases: ["q", "ls"],
    execute(message, args) {
      const guildId = message.guild.id
      let player = players.get(guildId)

      if (!player) {
        players.set(guildId, new Player())
        player = players.get(guildId)
      }

      player.ListQueue(message)
    }
  },
  {
    name: "current",
    aliases: ["np", "c"],
    execute(message, args) {
      const guildId = message.guild.id
      let player = players.get(guildId)

      if (!player) {
        players.set(guildId, new Player())
        player = players.get(guildId)
      }

      const currentSong = player.queue.currentSong
      if (!currentSong) return QuickEmbed(`No song currently playing`)

      let embed = new RichEmbed()
        .setTitle(`currently playing **${currentSong.title}**`)
        .setDescription(currentSong.duration.duration)
        .setColor(embedColor)

      message.channel.send(embed)
    }

    // {
    //   name: "volume increase",
    //   aliases: ["+", "inc"],
    //   wip: true,
    //   execute(message, args) {
    //     const amount = args.shift();
    //   }
    // }
  }
]


const players: Collection<string, Player> = new Collection()

export const command: Command = {
  name: "music",
  description: "Plays music",
  aliases: ["p", "play"],
  args: false,
  usage: "[Search | Link]",
  subCmd: subcmd,

  execute(message, args) {
    let query = args.join()
    if (query === "") return QuickEmbed(`${prefix}${this.usage}`)

    const guildId = message.guild.id

    let player = players.get(guildId)

    if (!player) {
      players.set(guildId, new Player())
      player = players.get(guildId)
    }

    player.AddSong(query, message)
  }
}

export function getPlayer(guildId: string) {
  let player = players.get(guildId)

  if (!player) {
    players.set(guildId, new Player())
    player = players.get(guildId)
  }

  return player
}

Command.init(command)
