import chalk from 'chalk';
import { Client } from 'discord.js';
import { createLogger, format, transports } from 'winston';
import { initEmoji } from './commands/music/play';
import { args as cmdArgs, isProduction, prefix, token } from './config';
import { connectToDB } from './db/database';
import { blockedUsers } from './db/dbBlocked';
import { initCommands } from './system/commandLoader';
import { initGreeter } from './system/serverGreeter';
import { syncRoles } from './system/syncRoles';
import { initVoiceManager } from './system/voiceManager';
import {
   findCommand,
   findCommandGroup,
   getCommandOverride,
   hasPerms,
   sendArgsError,
   userHasPerm
} from './util/commandUtil';
import { initPlayers } from './util/musicUtil';
import { wrap } from './util/styleUtil';

export const logger = createLogger({
   transports: [new transports.Console()],
   format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
});

const envString = isProduction ? '-------production-------' : '-------development-------';
logger.log('info', chalk.bgRed.bold(envString));
logger.log('info', chalk`{bold prefix:} {bgMagenta.bold ${prefix}}`);

const client = new Client({
   ws: {
      intents: [
         'GUILD_MEMBERS',
         'GUILD_MESSAGE_REACTIONS',
         'GUILD_MESSAGES',
         'GUILDS',
         'GUILD_EMOJIS',
         'GUILD_VOICE_STATES'
      ]
   },
   presence: {
      activity: {
         name: 'Catgirls',
         type: 'WATCHING',
         url: 'https://github.com/kira0x1/mikaela'
      }
   }
});

async function init() {
   const skipDB: boolean = cmdArgs['skipDB'];
   if (skipDB) logger.log('info', chalk.bgMagenta.bold('----SKIPPING DB----\n'));
   if (!skipDB) await connectToDB();

   client.login(token);
}

client.on('ready', () => {
   // Setup players
   initPlayers(client);

   // Save heart emoji to use for favorites
   initEmoji(client);

   // Add event listener to add/remove voice role
   if (isProduction) {
      initVoiceManager(client);

      // Add event listeners to #roles
      syncRoles(client);

      //Add event listener to welcome new members
      initGreeter(client);
   }
   // Read command files and create a collection for the commands
   initCommands();

   logger.log('info', chalk.bgCyan.bold(`${client.user.username} online!`));
});

client.on('message', message => {
   // Check if message is from a bot and that the message starts with the prefix
   if (message.author.bot || !message.content.startsWith(prefix)) {
      return;
   }

   // Make sure this command wasnt given in a dm unless by an admin
   if (message.channel.type === 'dm' && !userHasPerm(message.author.id, 'admin')) {
      return;
   }

   // Check if we are able to send messages in this channel
   if (
      message.channel.type === 'text' &&
      !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
   ) {
      return;
   }

   if (blockedUsers.has(message.author.id))
      return message.author.send("Sorry you're blocked");

   const firstCharacter = message.content.charAt(1);
   //Make sure the first character is not a number since people could just be writing decimals I.E .001
   if (firstCharacter === '.' || !isNaN(Number(firstCharacter))) return;

   // Split up message into an array and remove the prefix
   let args = message.content.slice(prefix.length).split(/ +/);

   // Remove the first element from the args array ( this is the command name )
   let commandName = args.shift();
   if (!commandName || commandName.includes(prefix) || commandName === prefix) return;

   // Set commandName to lowercase
   commandName = commandName.toLowerCase();

   // Search for the command
   let command = findCommand(commandName);

   // If the command wasnt found check if its in a commandgroup
   if (!command) {
      //Get the sub-command input given by the user
      const grp = findCommandGroup(commandName);

      if (grp) {
         //Get the sub-command input given by the user
         const subCmdName = args[0];

         //Check if the command-group contains the command
         command = grp.find(
            cmd =>
               cmd.name.toLowerCase() === subCmdName?.toLowerCase() ||
               (cmd.aliases &&
                  cmd.aliases.find(al => al.toLowerCase() === subCmdName?.toLowerCase()))
         );

         //If the command-group doesnt contain the command then check if the command-group has it set as an override
         if (!command) {
            command = getCommandOverride(commandName);
         } else {
            // If the command is not an overdrive command then remove the first argument, since its a subcommand
            args.shift();
         }
      }
   }

   // If command not found send a message
   if (!command)
      return message.author.send(`command ${wrap(commandName || '')} not found`);

   // If the command is disabled then return
   if (command.isDisabled) return;

   if (!hasPerms(message.author.id, commandName))
      return message.author.send(
         `You do not have permission to use ${wrap(command.name)}`
      );

   // If command arguments are required and not given send an error message
   if (command.args && args.length === 0) return sendArgsError(command, message);

   //Check if the command is in cooldown
   // if (checkCooldown(command, message)) return;

   // Finally if all checks have passed then try executing the command.
   try {
      command.execute(message, args);
   } catch (err) {
      logger.log('error', err);
   }
});

init();
