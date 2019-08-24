import { Message, MessageOptions } from "discord.js";
import { admins, prefix } from "../config";
import { CommandUtil } from "./CommandUtil";
import { darken, QuickEmbed } from "./Style";

let messageInstance: Message;

export function Send(content?: any, options?: MessageOptions) {
  messageInstance.channel.send(content, options);
}

export function GetMessage() {
  return messageInstance;
}

export function OnMessage(message: Message) {
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type !== "text") return;
  let args = message.content.slice(prefix.length).split(/ +/);
  messageInstance = message;

  //Command name
  let cname = (args.shift() || "none").toLowerCase();
  if (cname.startsWith(prefix) || cname === "none") return;

  const command = CommandUtil.GetCommand(cname);
  if (command === undefined) return QuickEmbed(`Command **${cname}** not found`);

  if (command.args && !args.length) {
    // Check if args is required
    return Send(darken(`${prefix}${command.name}`, command.usage || ""));
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
