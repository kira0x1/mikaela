import { readdirSync } from 'fs';
import path from 'path';
import { Command } from '../classes/Command';
import { CommandInfo } from '../classes/CommandInfo';
import { commands, commandGroups, commandInfos } from '../util/commandUtil';

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
               usageName: info.usageName
            };
            commandInfos.set(newInfo.name.toLowerCase(), newInfo);
         }
      });
}
