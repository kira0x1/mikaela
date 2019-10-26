import { Message, MessageOptions } from "discord.js";
import { admins, prefix } from "../config";
import { CommandUtil } from "./CommandUtil";
import { darken, QuickEmbed } from "./Style";

export function Send(message: Message, content?: any, options?: MessageOptions) {
  message.channel.send(content, options);
}

export async function OnMessage(message: Message) {
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== "text") return;
  let args = message.content.slice(prefix.length).split(/ +/);

  //Command name
  let cname = (args.shift() || "none").toLowerCase();
  if (cname.startsWith(prefix) || cname === "none") return;

  const command = CommandUtil.GetCommand(cname);
  if (command === undefined) return QuickEmbed(message, `Command **${cname}** not found`);

  // Check if args is required
  if (command.args && !args.length) {
    return Send(message, darken(`${prefix}${command.name}`, command.usage || ""));
  }

  let hasPerms = true;

  if (command.perms) {
    command.perms.map(perm => {
      if (perm === "admin") {
        if (message.author.id !== admins[0]) {
          hasPerms = false;
        }
      }
    });
  }

  if (hasPerms) command.execute(message, args);
}
