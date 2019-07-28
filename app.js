const { InsertUserCommand } = require('./util/dbUtil')
const Discord = require('discord.js');
const util = require('./util/util');
const commandUtil = require('./util/commandUtil');
const database = require('./commands/favorites');
const config = require('./config.json');
const chalk = require('chalk');
const ct = require('common-tags');
const log = console.log;

const token = config.keys.token;
const prefix = config.prefix;

const client = new Discord.Client();

client.once('ready', async () => {
	commandUtil.initCommands(client);
	await database.init();
	client.user.setActivity(`with commi's | ${prefix}help`, {
		type: 'PLAYING'
	});

	log(chalk`{bold.bgGreen ${client.user.username} Online!}`);

	//Display servers mikaela is apart of
	log(chalk`{bgMagenta.bold Guilds}`)
	let count = 0
	client.guilds.map(g => {
		count++
		log(chalk`{bgMagenta.bold ${count}: ${g.name}}`)
	})
});

const logCommandsToDB = false;
const logCommandsToConsole = false;

function logCommand(commandName, message, args, error) {
	let color = error ? `bold.bgRed` : `bold.bgGreen`

	if (logCommandsToConsole)
		log(chalk`{bold Command Recieved}{cyan :} {bold.blue ${prefix}${commandName}} 
	{${color} Args}{cyan :} {bold ${args.join(' ')}}
	{${color} User}{cyan :} {bold ${message.author.tag}}
	{${color} Guild}{cyan :} {bold ${message.guild.name}}
	\n`);
}

client.on('message', async message => {

	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// 	log(chalk`{red.bold Command Recieved}{cyan :} {bold ${prefix}${commandName}} 
	//   {red.bold Args}{cyan :} {bold ${args.join(' ')}}
	//   {red.bold User}{cyan :} {bold ${message.author.tag}}
	//   {red.bold Guild}{cyan :} {bold ${message.guild.name}}
	//   \n`);


	if (commandName.startsWith(prefix)) return;

	// ANCHOR Get command
	let command = commandUtil.findCommand(commandName);

	if (!command) {
		command = commandUtil.findSubCommand(commandName);
	}

	if (logCommandsToDB)
		InsertUserCommand(message.author.tag, commandName, args.join(' '), message.guild.name)

	if (!command) return;

	// Check if command is supposed to be used
	if (command.helper) { return console.log(`helper command '${command.name}' tried to be called by: ${message.author.tag}`); }

	// Check if command needs arguments
	if (command.args && !args.length) {
		return message.reply(util.usage(command));
	}

	// Check if guild only
	if (command.guildOnly && message.channel.type !== 'text') { return message.reply('That command cannot be used inside of dm\'s'); }

	if (!commandUtil.checkCommandPerms(command, message.author.id)) return;
	if (commandUtil.IsOnCoolDown(command, message)) return;

	// Try to execute command
	try {

		// Set current message in util
		util.getCurrentMessage(message);
		/**
    *
    *
    * @param {Discord.Message} message
    * @param {Array} args
    */
		await command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('error trying to call command');
	}
});

// bot login
client.login(token);
