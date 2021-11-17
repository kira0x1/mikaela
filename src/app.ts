import { Client } from 'discord.js';
import * as config from './config';
import * as db from './database';
import * as sys from './system';
import { getContextLogger, logger, stopAgenda } from './system';
import * as util from './util';

// print environment - production / development
logger.info(config.isProduction ? '-------production-------' : '-------development-------');

// print database - production db / development db
logger.info(
   config.isProduction || config.args['prodDB']
      ? '-------production DB-------'
      : '-------development DB-------'
);

// Instantiate discord.js client
export const client = new Client({
   intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES'],
   presence: {
      activities: [
         {
            name: 'Catgirls',
            type: 'WATCHING',
            url: 'https://github.com/kira0x1/mikaela'
         }
      ]
   },
   allowedMentions: { parse: ['users'], repliedUser: true }
});

async function init() {
   const skipDB: boolean = config.args['skipDB'];
   if (skipDB) logger.info('----SKIPPING DB----\n');

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

   sys.syncReminders(client);

   // Read command files and create a collection for the commands
   sys.initCommands();

   await sys.initAgenda();

   logger.info(`${client.user.username} online in ${client.guilds.cache.size} servers!`);
});

client.on('guildCreate', guild => {
   logger.info(`Joined new guild: ${guild.name}`, {
      interactionType: 'JoinedGuild',
      clientID: client.user.id,
      guildID: guild.id,
      guildName: guild.name
   });
});

// eslint-disable-next-line complexity
client.on('messageCreate', message => {
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
   if (message.channel.type === 'DM' && !config.perms.admin.users.includes(message.author.id)) {
      return;
   }

   // Check if we are able to send messages in this channel
   if (
      message.channel.type === 'GUILD_TEXT' &&
      !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')
   ) {
      return;
   }

   // Check if user is blocked
   if (db.blockedUsers.has(message.author.id)) {
      message.author.send("Sorry you're blocked");
      return;
   }

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
      message.author.send({ embeds: [embed] });
      return;
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
         message.author.send(`You do not have permission to use ${util.wrap(command.name)}`);
         return;
      } catch (e) {}
   }

   // If command arguments are required and not given send an error message
   if (command.args && args.length === 0) {
      util.sendArgsError(command, message);
      return;
   }

   // Check if the command is in cooldown
   // if (checkCooldown(command, message)) return;

   if (message.guild) {
      // Check bot permissions
      if (command.botPerms && !message.guild.me.permissions.has(command.botPerms)) {
         return util.sendErrorEmbed(message, "I don't have permissions for that");
      }

      // Check user permissions
      if (command.userPerms && !message.member.permissions.has(command.userPerms)) {
         return util.sendErrorEmbed(message, `You don\'t have permission to do that`);
      }
   }

   const ctxLogger = getContextLogger(message, command.name);

   // Finally if all checks have passed then try executing the command.
   try {
      ctxLogger.info(`Executing command: ${command.name}`);
      command.execute(message, args);
   } catch (error) {
      ctxLogger.error(`Error on command: ${command.name}\n${error}`);
   }
});

// on shutdown signal save the queue to the database
// so we can play the queue after restart
process.on('message', async (msg: string) => {
   if (msg !== 'shutdown') return;
   logger.info(`Gracefuly Stopping`);

   // util.players.map(p => p.saveQueueState());
   // await db.saveAllServersQueue();

   await stopAgenda();
   await db.dbConnection.close();
   process.exit(0);
});

process.on('uncaughtException', error => logger.error(error));
process.on('unhandledRejection', error => logger.error(error));

init();
