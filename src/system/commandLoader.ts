import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import path from 'path';
import { logger } from '.';
import { client } from '../app';
import { Command } from '../classes/Command';
import { CommandInfo } from '../classes/CommandInfo';
import { token } from '../config';
import { commandGroups, commandInfos, commands } from '../util/commandUtil';

export function initCommands() {
   const infos: CommandInfo[] = [];

   readdirSync(path.join(__dirname, '..', 'commands', 'info'))
      .filter(file => file.endsWith('js'))
      .map(file => {
         const { info } = require(path.join(__dirname, '..', 'commands', 'info', file));
         infos.push(info);
      });

   readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(file => file.endsWith('js'))
      .map(file => {
         const { command } = require(path.join(__dirname, '..', 'commands', file));
         const cmd: Command = command;

         commands.set(cmd.name, cmd);
      });

   readdirSync(path.join(__dirname, '..', 'commands'))
      .filter(folder => folder !== 'info')
      .filter(file => file.endsWith('.js') === false && !file.endsWith('.map'))
      .map(folder => {
         const folderCommands: Command[] = [];
         readdirSync(path.join(__dirname, '..', 'commands', folder))
            .filter(file => file.endsWith('.map') === false)
            .map(file => {
               const { command } = require(path.join(__dirname, '..', 'commands', folder, file));

               const cmd: Command = command;
               folderCommands.push(cmd);

               if (!cmd.isSubCommand) {
                  commands.set(cmd.name.toLowerCase(), cmd);
               }
            });

         if (folder) {
            commandGroups.set(folder, folderCommands);
         }

         const info = infos.find(cmd => cmd.name.toLowerCase() === folder);

         if (info) {
            const commandsFound = commandGroups.get(info.name.toLowerCase()) || [];
            const newInfo: CommandInfo = {
               name: info.name,
               description: info.description,
               aliases: info.aliases,
               commands: commandsFound,
               perms: info.perms,
               hidden: info.hidden,
               override: info.override,
               requiresPrefix: info.requiresPrefix,
               usageName: info.usageName,
               paginate: info.paginate
            };
            commandInfos.set(newInfo.name.toLowerCase(), newInfo);
         }
      });
}

/**
 * Transforms a type of Command to an interaction command
 */
export function transformCommand(command: Command) {
   const res = new SlashCommandSubcommandBuilder()
      .setName(command.name.toLowerCase())
      .setDescription(command.description);

   command.interactionOptions?.map(op => {
      res.options.push(op);
   });

   return res;
}

export async function loadInteractionCommands(commands: Command[]) {
   const clientId = client.user.id;
   const guildIds = client.guilds.cache.map(g => g.id);

   const rest = new REST({ version: '9' }).setToken(token);

   try {
      logger.info('Refreshing slash commands');

      for (const guildId of guildIds) {
         await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
            body: commands.map(c => transformCommand(c))
         });
      }

      console.log('Successfully reloaded application / commands');
   } catch (error) {
      console.error(error);
   }
}
