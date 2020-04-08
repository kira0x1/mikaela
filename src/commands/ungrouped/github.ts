import { ICommand } from "../../classes/Command";

export const command: ICommand = {
   name: "Github",
   description: "Links mikaelas github",
   aliases: ["git", "code"],

   async execute(message, args) {
      message.channel.send(`> **Mikaela's Github**\nhttps://github.com/lil-kira/MikaelaBot/`);
   },
};
