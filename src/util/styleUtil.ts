import { Message, MessageEmbed, User } from 'discord.js';
import ms from 'ms';

import { logger } from '../app';
import { createDeleteCollector } from './musicUtil';

const redColor = 0xcf274e;
// const blueColor = 0x4e74e6;
// const oldBlueColor = 0x6788eb;

export const embedColor = redColor;

export function darken(...content: string[]): string {
   const tag = `\``;
   return wrap(content, tag);
}

export function wrap(content: string[] | string, wrap = '`'): string {
   if (typeof content === 'string') return wrap + content + wrap;

   return content
      .filter(str => str !== ``)
      .map(str => wrap + str + wrap)
      .join(' ');
}

export const errorIconUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/835451455208423424/error_icon.png';
export const successIconUrl =
   'https://cdn.discordapp.com/attachments/702091543514710027/835456148811415602/success_icon.png';

export interface ErrorEmbedOptions {
   errorTitle?: string;
   autoDelete?: boolean;
}

const defaultErrorEmbedOptions: ErrorEmbedOptions = {
   autoDelete: false
};

export async function sendErrorEmbed(message: Message, errorMessage: string, options?: ErrorEmbedOptions) {
   // if no options given then use default
   if (!options) options = defaultErrorEmbedOptions;

   let embed = createFooter(message).setDescription(`**${errorMessage}**`).setThumbnail(errorIconUrl);

   if (options.errorTitle) embed.setTitle(options.errorTitle);

   const msg = await message.channel.send({ embeds: [embed] });
   createDeleteCollector(msg, message);
}

export function createFooter(message: Message, overrideAuthor?: User): MessageEmbed {
   const author = overrideAuthor || message.author;

   const embed = new MessageEmbed()
      .setColor(embedColor)
      .setFooter(author.username, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp(Date.now());

   return embed;
}

export interface QuickEmbedOptions {
   addDeleteCollector?: boolean;
   addFooter?: boolean;
   autoDelete?: boolean;
   deleteDelay?: string;
   deleteCollectorOwnerId?: string;
   deleteOriginalMessage?: boolean;
}

export async function quickEmbed(message: Message, content: string, options?: QuickEmbedOptions) {
   const addFooter = options?.addFooter || true;
   const autoDelete = options?.autoDelete;
   const deleteDelay = options?.deleteDelay;
   const addDeleteCollector = options?.addDeleteCollector || true;
   const deleteOriginalMessage =
      options?.deleteOriginalMessage === undefined ? true : options.deleteOriginalMessage;

   const embed = addFooter ? createFooter(message) : new MessageEmbed().setColor(embedColor);
   embed.setTitle(content);
   const msg = await message.channel.send({ embeds: [embed] });

   if (autoDelete) {
      autoDeleteMessage(message, deleteDelay);
   }

   if (addDeleteCollector) {
      createDeleteCollector(msg, message, options?.deleteCollectorOwnerId, deleteOriginalMessage);
   }
}

async function autoDeleteMessage(message: Message | Promise<Message>, delay = '10s') {
   const msg = message instanceof Message ? message : await message;

   setTimeout(() => {
      deleteMessage(msg);
   }, ms(delay));
}

export function deleteMessage(message: Message) {
   if (!message.deletable) {
      logger.info(`Message not deletable\nfrom: ${message.author.username}\ncontent:${message.content}`);
      return;
   }

   message.delete();
}

export function createEmptyField(inline?: boolean | false) {
   return { name: `\u200b`, value: '\u200b', inline: true };
}

export function addCodeField(
   embed: MessageEmbed,
   content: string,
   title?: string,
   blank?: boolean,
   lang = 'yaml',
   inline?: boolean | false
) {
   const value = `\`\`\`${lang}\n${content}\`\`\``;

   if (title && blank) title = `\u200b\n${title}`;
   embed.addField(title ? title : `\u200b`, value, inline);
}
