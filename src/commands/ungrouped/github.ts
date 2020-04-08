import { ICommand } from "../../classes/Command";
import { QuickEmbed, embedColor } from "../../util/Style";
import { RichEmbed } from "discord.js";

export const command: ICommand = {
   name: "Github",
   description: "Links mikaelas github",
   aliases: ["source", "code"],

   async execute(message, args) {
      message.channel.send(`> **Mikaela's Github**\nhttps://github.com/lil-kira/MikaelaBot/`);
   },
};
