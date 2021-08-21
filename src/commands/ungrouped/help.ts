import { Collection, Constants, Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import ms from 'ms';
import { logger } from '../../app';
import { Command } from '../../classes/Command';
import { CommandInfo } from '../../classes/CommandInfo';
import { prefix } from '../../config';
import {
   commandGroups,
   commandInfos,
   findCommand,
   findCommandInfo,
   hasPerms
} from '../../util/commandUtil';
import { createDeleteCollector } from '../../util/musicUtil';
import { createFooter, wrap } from '../../util/styleUtil';

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

   // Create embed
   const embed = createFooter(message)
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

   const msg = await message.channel.send(embed);
   createDeleteCollector(msg, message);
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

   // Create embed
   const embed = createFooter(message);

   // If we have the command
   if (command) {
      if (command.isDisabled) embed.setTitle('This command is disabled at the moment');
      else InsertCommandEmbed(embed, command);

      const msg = await message.channel.send(embed);
      createDeleteCollector(msg, message);
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
   commands.map(cmd => addCommandToEmbed(cmd, embed));

   // Send embed
   const msg = await message.channel.send(embed);

   // Add reaction to delete embed when user is done
   createDeleteCollector(msg, message);
}

async function createHelpPagination(info: CommandInfo, embed: MessageEmbed, message: Message) {
   const commands = info.commands.filter(cmd => !cmd.isDisabled);
   if (!info.paginate) {
      commands.map(cmd => addCommandToEmbed(cmd, embed));
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
   embed.setTitle(`${info.name}\nPage ${1}/${pages.size}`);
   page.map(command => addCommandToEmbed(command, embed));

   const msg = await message.channel.send(embed);

   // If there are only 1 or none pages then dont add the next, previous page emojis / collector
   if (pages.size <= 1) {
      createDeleteCollector(msg, message);
      return;
   }

   msg.react('⬅')
      .then(() => msg.react('➡'))
      .finally(() => createDeleteCollector(msg, message));

   const filter = (reaction: MessageReaction, userReacted: User) => {
      return (reaction.emoji.name === '➡' || reaction.emoji.name === '⬅') && !userReacted.bot;
   };

   const collector = msg.createReactionCollector(filter, { time: ms('5h') });

   let currentPage = 0;

   collector.on('collect', async (reaction: MessageReaction, userReacted: User) => {
      if (reaction.emoji.name === '➡') {
         currentPage++;
         if (currentPage >= pages.size) currentPage = 0;
      } else if (reaction.emoji.name === '⬅') {
         currentPage--;
         if (currentPage < 0) currentPage = pages.size - 1;
      }

      reaction.users.remove(userReacted);
      const newEmbed = createFooter(message);
      newEmbed.setTitle(`${info.name}\nPage ${currentPage + 1}/${pages.size}`);

      const page = pages.get(currentPage);
      page.map(command => addCommandToEmbed(command, newEmbed));

      msg.edit(newEmbed);
   });

   collector.on('end', collected => {
      msg.reactions.removeAll().catch(error => {
         if (error.code !== Constants.APIErrors.UNKNOWN_MESSAGE) logger.error(error);
      });
   });
}

function addCommandToEmbed(command: Command, embed: MessageEmbed) {
   let description = command.description;

   // Add aliases to the description
   if (command.aliases) {
      description += `\naliases: ${wrap(command.aliases, '`')}`;
   }

   // Add Command's usage to the description
   description += `\n${getUsage(command)}`;

   // Add command to the embed
   embed.addField(command.name.toLowerCase(), description);
}

function getUsage(command: Command): string {
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

function InsertCommandEmbed(embed: MessageEmbed, command: Command) {
   embed.setTitle(command.name);
   embed.setDescription(command.description);

   if (command.usage) {
      embed.addField('Usage', wrap(command.usage, '`'));
   }

   if (command.aliases) {
      const aliasesString = wrap(command.aliases, '`');
      embed.addField('aliases: ', aliasesString);
   }

   return embed;
}
