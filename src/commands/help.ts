import { RichEmbed, Message } from "discord.js";
import { Command, Flag } from "../objects/Command";
import { CommandUtil } from "../util/CommandUtil";
import { createEmptyField, createField, embedColor, ListEmbed, QuickEmbed } from "../util/Style";

export const command: Command = {
  name: "help",
  description: "List Commands",
  aliases: ["h"],
  cooldown: 3,

  async execute(message, args) {
    if (args.length === 0 || !args) HelpAll(message);
    else HelpCommand(message, args);
  }
};

function HelpAll(message: Message) {
  let fields: Array<{ title: string; content?: string; inline?: boolean }>;
  fields = CommandUtil.GetCommands().map(cmd => ({
    title: cmd.name,
    content: cmd.description + "\n \u200b",
    inline: false
  }));
  ListEmbed(message, "Commands", undefined, fields);
}

function HelpCommand(message: Message, args: string[]) {
  {
    const commandName = args.shift().toLowerCase();
    const command = CommandUtil.GetCommand(commandName);

    //Check if command is found
    if (!command) return QuickEmbed(message, `Command not found`);

    //Create embed
    const embed = new RichEmbed().setColor(embedColor);
    embed.fields.push(createField(command.name, command.description + `\n\u200b`));

    if (command.flags) {
      insertFlags(embed, command.flags);
    } else if (command.subCmd) {
      insertFlags(embed, command.subCmd);
    }

    message.channel.send(embed);
  }
}

function insertFlags(embed: RichEmbed, children: Flag[] | Command[]) {
  //Get amound of rows for flags
  const rows = Math.ceil(children.length / 3);
  let flagIndex = 0;

  //Add command flags
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < 3; col++) {
      if (flagIndex >= children.length) {
        embed.fields.push(createEmptyField(true));
      } else {
        let aliases = 'aliases: none'
        if (children[flagIndex].aliases !== undefined)
          aliases = children[flagIndex].aliases.join(", ")

        embed.fields.push(createField(children[flagIndex].name, aliases, true));
      }
      flagIndex++;
    }
  }
}
