import chalk from 'chalk';
import { Client } from 'discord.js';
import { createLogger, format, transports } from 'winston';
import { args as cmdArgs, isProduction, perms, prefix as defaultPrefix, token } from './config';
import { initServers, saveAllServersQueue, prefixes } from './database/api/serverApi';
import { connectToDB, db } from './database/dbConnection';
import { blockedUsers } from './database/models/Blocked';
import { initCommands } from './system/commandLoader';
import { initGreeter } from './system/serverGreeter';
import { syncRoles } from './system/syncRoles';
import { initVoiceManager } from './system/voiceManager';
import {
   findCommand,
   findCommandGroup,
   getCommandOverride,
   hasPerms,
   sendArgsError
} from './util/commandUtil';
import { initPlayers, players } from './util/musicUtil';
import { sendErrorEmbed, wrap } from './util/styleUtil';

export const mikaelaId = '585874337618460672';

// Create logger
export const logger = createLogger({
   transports: [new transports.Console()],
   format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
});

// print args - production, skipdb, etc
const envString = isProduction ? '-------production-------' : '-------development-------';
const dbString =
   isProduction || cmdArgs['prodDB'] ? '-------production DB-------' : '-------development DB-------';
logger.info(chalk.bgRed.bold(envString));
logger.info(chalk.bgRed.bold(dbString));

// print testvc arg
cmdArgs['testvc'] && logger.info(chalk.bgGray.bold(`Will only join test vc`));

// print prefix
// logger.info(chalk`{bold prefix:} {bgMagenta.bold ${prefix}}`);

// Instantiate discord.js client
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
   },
   disableMentions: 'everyone'
});

async function init() {
   const skipDB: boolean = cmdArgs['skipDB'];
   if (skipDB) logger.log('info', chalk.bgMagenta.bold('----SKIPPING DB----\n'));

   // if skipdb flag is false then connect to mongodb
   if (!skipDB) await connectToDB();

   // login to discord
   client.login(token);
}

client.on('ready', async () => {
   // Setup Prefixes
   await initServers(client);

   // Setup players
   initPlayers(client);

   // Add event listener to add/remove voice role
   initVoiceManager(client);

   // Make sure were in production, and not on mikaela 2
   if (isProduction && client.user.id === mikaelaId) {
      // Add event listeners to #roles
      syncRoles(client);

      // Add event listener to welcome new members
      initGreeter(client);
   }

   // Read command files and create a collection for the commands
   initCommands();

   logger.log('info', chalk.bgCyan.bold(`${client.user.username} online!`));
});

// eslint-disable-next-line complexity
client.on('message', async message => {
   const prefix = prefixes.get(message.guild?.id) || defaultPrefix;

   const prefixGiven = message.content.substr(0, prefix.length);

   // Check if message is from a bot and that the message starts with the prefix
   if (message.author.bot || prefixGiven !== prefix) {
      // check if user mentioned the bot instead of using the prefix
      const mention = message.mentions.users.first();
      if (mention?.id !== client.user.id) {
         return;
      }
   }

   // Make sure this command wasnt given in a dm unless by an admin
   if (message.channel.type === 'dm' && !perms.admin.users.includes(message.author.id)) {
      return;
   }

   // Check if we are able to send messages in this channel
   if (
      message.channel.type === 'text' &&
      !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
   ) {
      return;
   }

   if (blockedUsers.has(message.author.id)) return message.author.send("Sorry you're blocked");

   if (prefix === '.') {
      const firstCharacter = message.content.charAt(1);
      // Make sure the first character is not a number since people could just be writing decimals I.E .001
      if (firstCharacter === '.' || !isNaN(Number(firstCharacter))) return;
   }

   // Split up message into an array and remove the prefix
   let args = message.content.slice(message.content.startsWith(prefix) ? prefix.length : 0).split(/ +/);
   if (!message.content.startsWith(prefix)) args.shift();

   // Remove the first element from the args array ( this is the command name )
   let commandName = args.shift();
   if (!commandName) commandName = args.shift();

   if (!commandName || commandName === prefix) {
      return;
   }

   // Set commandName to lowercase
   commandName = commandName.toLowerCase();

   // Search for the command
   let command = findCommand(commandName);

   // If the command wasnt found check if its in a commandgroup
   if (!command) {
      // Get the sub-command input given by the user
      const grp = findCommandGroup(commandName);

      if (grp) {
         // Get the sub-command input given by the user
         const subCmdName = args[0];

         // Check if the command-group contains the command
         command = grp.find(
            cmd =>
               cmd.name.toLowerCase() === subCmdName?.toLowerCase() ||
               cmd.aliases?.find(al => al.toLowerCase() === subCmdName?.toLowerCase())
         );

         // If the command-group doesnt contain the command then check if the command-group has it set as an override
         if (!command) {
            command = getCommandOverride(commandName);
         } else {
            // If the command is not an overdrive command then remove the first argument, since its a subcommand
            args.shift();
         }
      }
   }

   // If command not found send a message
   if (!command) {
      return message.author.send(`command ${wrap(commandName || '')} not found`);
   }

   // If the command is disabled then return
   if (command.isDisabled) return;

   if (!hasPerms(message.member, commandName))
      return message.author.send(`You do not have permission to use ${wrap(command.name)}`);

   // If command arguments are required and not given send an error message
   if (command.args && args.length === 0) return sendArgsError(command, message);

   // Check if the command is in cooldown
   // if (checkCooldown(command, message)) return;

   if (message.guild) {
      // Check bot permissions
      if (command.botPerms && !message.guild.me.hasPermission(command.botPerms)) {
         return sendErrorEmbed(message, "I don't have permissions for that");
      }

      // Check user permissions
      if (command.userPerms && !message.member.hasPermission(command.userPerms)) {
         return sendErrorEmbed(message, `You don\'t have permission to do that`);
      }
   }

   // Finally if all checks have passed then try executing the command.
   try {
      command.execute(message, args);
   } catch (err) {
      logger.log('error', err);
   }
});

// on shutdown signal save the queue to the database
// so we can play the queue after restart
process.on('message', async (msg: string) => {
   if (msg !== 'shutdown') return;
   logger.info(chalk.bgMagenta.bold(`Gracefuly Stopping`));
   players.map(p => p.saveQueueState());
   await saveAllServersQueue();
   await db.close();
   process.exit(0);
});

process.on('uncaughtException', error => logger.error(error));
process.on('unhandledRejection', error => logger.error(error));

init();
