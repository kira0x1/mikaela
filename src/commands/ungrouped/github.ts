import { ICommand } from "../../classes/Command";
import { QuickEmbed, embedColor } from "../../util/Style";
import { RichEmbed } from "discord.js";

export const command: ICommand = {
  name: "Github",
  description: "Links mikaelas github",
  aliases: ["source", "code"],

  async execute(message, args) {
    const embed = new RichEmbed()
      .setTitle("Github")
      .addField(
        "URL",
        `\`\`\`yaml
https://github.com/lil-kira/MikaelaBot/\`\`\``
      )
      .setColor(embedColor);

    message.channel.send(embed);
  }
};
