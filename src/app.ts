import chalk from 'chalk';
import { Client } from 'discord.js';
import { createLogger, format, transports } from 'winston';

import * as config from './config';
import * as db from './database';
import * as sys from './system';
import * as util from './util';

// Create logger
export const logger = createLogger({
   transports: [new transports.Console()],
   format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`)
});

// print environment - production / development
logger.info(
   chalk.bgRed.bold(config.isProduction ? '-------production-------' : '-------development-------')
);

// print database - production db / development db
logger.info(
   chalk.bgRed.bold(
      config.isProduction || config.args['prodDB']
         ? '-------production DB-------'
         : '-------development DB-------'
   )
);

// print testvc arg
if (config.args['testvc']) logger.info(chalk.bgGray.bold(`Will only join test vc`));

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
      activity: { name: 'Catgirls', type: 'WATCHING' }
   },
   disableMentions: 'everyone'
});

async function init() {
   const skipDB: boolean = config.args['skipDB'];
   if (skipDB) logger.log('info', chalk.bgMagenta.bold('----SKIPPING DB----\n'));

   // if skipdb flag is false then connect to mongodb
   if (!skipDB) await db.connectToDB();

   // login to discord
   client.login(config.token);
}

client.on('ready', async () => {
   const skipDB: boolean = config.args['skipDB'];

   // Setup Prefixes
   if (!skipDB) await db.initServers(client);

   // Setup players
   util.initPlayers(client);

   // Add event listener to add/remove voice role
   sys.initVoiceManager(client);

   // Make sure were in production, and not on mikaela 2
   if (config.isProduction && client.user.id === config.mainBotId) {
      // Add event listeners to #roles
      sys.syncRoles(client);

      // Add event listener to welcome new members
      sys.initGreeter(client);
   }

   sys.syncReminders(client);

   // Read command files and create a collection for the commands
   sys.initCommands();

   logger.info(chalk.bgCyan.bold(`${client.user.username} online in ${client.guilds.cache.size} servers!`));
});

// eslint-disable-next-line complexity
client.on('message', async message => {
   // check if the server has a custom prefix if not then use the default prefix
   const prefix = db.prefixes.get(message.guild?.id) || config.prefix;

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
   if (message.channel.type === 'dm' && !config.perms.admin.users.includes(message.author.id)) {
      return;
   }

   // Check if we are able to send messages in this channel
   if (
      message.channel.type === 'text' &&
      !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
   ) {
      return;
   }

   // Check if user is blocked
   if (db.blockedUsers.has(message.author.id)) return message.author.send("Sorry you're blocked");

   // Check if this channel is black listed by the server moderators
   const channelId = message.channel.id;
   const guildId = message.guild.id;

   const blackListedChannels = db.bannedChannels.get(guildId);
   const bannedChannel = blackListedChannels?.find(c => c.id === channelId);

   if (bannedChannel) {
      const embed = util
         .createFooter(message)
         .setTitle(`Channel "${bannedChannel.name}" is banned from use`)
         .setDescription(`Banned by <@${bannedChannel.bannedBy}>`);
      return message.author.send(embed);
   }

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
   let command = util.findCommand(commandName);

   // If the command wasnt found check if its in a commandgroup
   if (!command) {
      // Get the sub-command input given by the user
      const grp = util.findCommandGroup(commandName);

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
            command = util.getCommandOverride(commandName);
         } else {
            // If the command is not an overdrive command then remove the first argument, since its a subcommand
            args.shift();
         }
      }
   }

   // If command not found send a message
   if (!command) {
      // message.author.send(`command ${wrap(commandName || '')} not found`);
      return;
   }

   // If the command is disabled then return
   if (command.isDisabled) return;

   if (!util.hasPerms(message.member, commandName)) {
      try {
         return message.author.send(`You do not have permission to use ${util.wrap(command.name)}`);
      } catch (e) {}
   }

   // If command arguments are required and not given send an error message
   if (command.args && args.length === 0) return util.sendArgsError(command, message);

   // Check if the command is in cooldown
   // if (checkCooldown(command, message)) return;

   if (message.guild) {
      // Check bot permissions
      if (command.botPerms && !message.guild.me.hasPermission(command.botPerms)) {
         return util.sendErrorEmbed(message, "I don't have permissions for that");
      }

      // Check user permissions
      if (command.userPerms && !message.member.hasPermission(command.userPerms)) {
         return util.sendErrorEmbed(message, `You don\'t have permission to do that`);
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

   util.players.map(p => p.saveQueueState());

   await db.saveAllServersQueue();
   await db.dbConnection.close();
   process.exit(0);
});

process.on('uncaughtException', error => logger.error(error));
process.on('unhandledRejection', error => logger.error(error));

init();
