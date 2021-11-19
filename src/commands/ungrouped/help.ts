import { randomUUID } from 'crypto';
import {
   ButtonInteraction,
   CacheType,
   Collection,
   Message,
   MessageActionRow,
   MessageButton,
   MessageEmbed
} from 'discord.js';
import ms from 'ms';
import { Command, CommandInfo } from '../../classes';
import { prefixes } from '../../database';
import {
   commandGroups,
   commandInfos,
   createFooter,
   findCommand,
   findCommandInfo,
   hasPerms,
   wrap
} from '../../util';
import * as config from '../../config';

export const command: Command = {
   name: 'Help',
   description: 'Lists all commands',
   aliases: ['h'],

   execute(message, args) {
      const query = args.join(' ');
      if (!query) {
         displayAll(message);
      } else {
         displayOne(message, query);
      }
   }
};

async function displayAll(message: Message) {
   const grouped: Command[] = [];

   // Add all grouped commands to the grouped array so we can cross
   // reference this later to check for ungrouped commands
   commandGroups.map(grp => {
      grp.map(cmd => {
         if (hasPerms(message.member, cmd.name) && !cmd.hidden && !cmd.isDisabled) grouped.push(cmd);
      });
   });

   const prefix = prefixes.get(message.guild?.id) || config.prefix;

   // Create embed
   const embed = createFooter(message.author)
      .setTitle(`Commands`)
      .setDescription(`For information about a command or category\n**${prefix}help [command]**`);

   // Add all ungrouped commands to the embed
   const ungrouped = commandGroups
      .get('ungrouped')
      ?.filter(cmd => hasPerms(message.member, cmd.name) && !cmd.hidden);

   if (ungrouped) {
      ungrouped.map(cmd => {
         if (hasPerms(message.member, cmd.name) && !cmd.hidden)
            embed.addField(cmd.name, cmd.description, true);
      });
   }

   // Add all group commands info to the embed
   commandInfos.map(info => {
      if (hasPerms(message.member, info.name)) embed.addField(info.name, info.description, true);
   });

   message.channel.send({ embeds: [embed] });
}

async function displayOne(message: Message, query: string) {
   // Look for Command
   const command = findCommand(query);

   // Get command info
   const info = findCommandInfo(query);

   // If command was not found or if the user doesnt have permission then respond with Command not found
   if (!command && !info) {
      message.author.send(`Command ${wrap(query)} not found`);
      return;
   }

   if (!hasPerms(message.member, query))
      return message.author.send(`You do not have permission to use ${wrap(command?.name || info?.name)}`);

   // Get prefix
   const prefix = prefixes.get(message.guild?.id) || config.prefix;

   // Create embed
   const embed = createFooter(message.author);

   // If we have the command
   if (command) {
      if (command.isDisabled) embed.setTitle('This command is disabled at the moment');
      else InsertCommandEmbed(embed, command, prefix);

      message.channel.send({ embeds: [embed] });
      return;
   }

   // If we dont have the command, then it must be an info group
   // Check if the info group has any commands
   if (!info.commands) return;

   if (info.paginate) {
      createHelpPagination(info, embed, message);
      return;
   }

   // Loop through all the commands in the CommandInfo class
   const commands = info.commands.filter(cmd => !cmd.isDisabled);
   commands.map(cmd => addCommandToEmbed(cmd, embed, prefix));

   // Send embed
   message.channel.send({ embeds: [embed] });
}

async function createHelpPagination(info: CommandInfo, embed: MessageEmbed, message: Message) {
   // Get prefix
   const prefix = prefixes.get(message.guild?.id) || config.prefix;

   // Get commands that are not disabled
   const commands = info.commands.filter(cmd => !cmd.isDisabled);

   if (!info.paginate) {
      commands.map(cmd => addCommandToEmbed(cmd, embed, prefix));
      return;
   }

   const pages: Collection<number, Command[]> = new Collection();
   let count = 0;
   let pageAtInLoop = 0;

   pages.set(0, []);

   for (const command of commands) {
      if (count >= 5) {
         count = 0;
         pageAtInLoop++;
         pages.set(pageAtInLoop, []);
      }

      const pageCommands = pages.get(pageAtInLoop);
      if (pageCommands) pageCommands.push(command);

      count++;
   }

   const page = pages.get(0);
   embed.setTitle(createPageEmbedTitle(info, pages, 1));
   embed.setDescription(`***${commands.length} commands***`);

   page.map(command => addCommandToEmbed(command, embed, prefix));

   // If there are only 1 or none pages then dont add the next, previous page emojis / collector
   if (pages.size <= 1) {
      message.channel.send({ embeds: [embed] });
      return;
   }

   const nextId = randomUUID();
   const backId = randomUUID();

   const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId(backId).setLabel('Back').setStyle('PRIMARY'),
      new MessageButton().setCustomId(nextId).setLabel('Next').setStyle('PRIMARY')
   );

   const msg = await message.channel.send({ embeds: [embed], components: [row] });

   const filter = (i: ButtonInteraction<CacheType>) => {
      return i.customId === nextId || i.customId === backId;
   };

   const collector = msg.channel.createMessageComponentCollector({
      filter,
      componentType: 'BUTTON',
      time: ms('3h')
   });

   let currentPage = 0;

   collector.on('collect', async i => {
      if (!i.isButton()) return;

      if (i.customId === nextId) {
         currentPage++;
         if (currentPage >= pages.size) currentPage = 0;
      } else if (i.customId === backId) {
         currentPage--;
         if (currentPage < 0) currentPage = pages.size - 1;
      }

      const newEmbed = createFooter(message.author);
      newEmbed.setTitle(createPageEmbedTitle(info, pages, currentPage + 1));
      newEmbed.setDescription(`***${commands.length} commands***`);

      const page = pages.get(currentPage);
      page.map(command => addCommandToEmbed(command, newEmbed, prefix));

      await i.update({ embeds: [newEmbed] });
   });
}

function addCommandToEmbed(command: Command, embed: MessageEmbed, prefix: string) {
   let description = command.description;

   // Add aliases to the description
   if (command.aliases) {
      description += `\naliases: ${wrap(command.aliases, '`')}`;
   }

   // Add Command's usage to the description
   description += `\n${getUsage(command, prefix)}`;

   // Add command to the embed
   embed.addField(command.name.toLowerCase(), description);
}

function getUsage(command: Command, prefix: string): string {
   let usage = ``;

   if (command.isSubCommand) {
      let cmdGroup = '';

      commandGroups.map((commands, group) => {
         if (commands.includes(command)) {
            const commandInfo = findCommandInfo(group);
            cmdGroup = commandInfo.usageName || group;
         }
      });

      if (command.usage) usage = wrap(`${prefix}${cmdGroup} ${command.name} ${command.usage}`, '`');
   } else if (command.usage) {
      usage = wrap(`${prefix}${command.name} ${command.usage}`, '`');
   }

   return usage;
}

function InsertCommandEmbed(embed: MessageEmbed, command: Command, prefix: string) {
   embed.setTitle(command.name);
   embed.setDescription(command.description);

   if (command.usage) {
      embed.addField('Usage', getUsage(command, prefix));
   }

   if (command.aliases) {
      const aliasesString = command.aliases.length > 0 ? wrap(command.aliases, '`') : wrap('none', '`');
      embed.addField('aliases: ', aliasesString);
   }

   return embed;
}

function createPageEmbedTitle(info: CommandInfo, pages: Collection<number, Command[]>, pageAt = 1) {
   return `${info.name}\nPage ${pageAt}/${pages.size}`;
}
