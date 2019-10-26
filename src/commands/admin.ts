import { Command } from "../objects/command";
import { users } from '../db/dbUser';
import { createField, ListEmbed, QuickEmbed } from '../util/Style';
import { Message } from 'discord.js';

const subcmd: Command[] = [
  {
    name: 'users',
    description: 'list users',
    aliases: ['usr', 'lsusr'],
    execute(message: Message, args) {
      QuickEmbed(message, `Searching Database...`)
      const userFields = []
      users.forEach(user => {
        const fld = createField(user.tag, `nickname: ${user.nickname}\nid:${user.id}\nfavorites: ${user.favorites}}`)
        userFields.push(fld);
      })
      ListEmbed(message, `users`, undefined, userFields)
    }
  },
  {
    name: 'test',
    description: "test",
    aliases: ['ts'],
    execute(message, args) {
    }
  }
]

export const command: Command = {
  name: "admin",
  aliases: ['sys'],
  args: false,
  description: "Admin commands",
  usage: "",
  subCmd: subcmd,

  execute(message, args) {

  }
};