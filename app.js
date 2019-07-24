const Discord = require('discord.js')
const util = require('./util/util')
const commandUtil = require('./util/commandUtil')
const database = require('./commands/favorites')
const config = require('./config.json')
const chalk = require('chalk')
const ct = require('common-tags')

const token = config.keys.token
const prefix = config.prefix

const client = new Discord.Client()

client.once('ready', async () => {
  commandUtil.initCommands(client)
  await database.init()
  client.user.setActivity(`with commi's | ${prefix}help`, {
    type: 'PLAYING',
  })
  console.log(chalk`{bold ${client.user.username} Online!}`)

})

client.on('message', async message => {

  if (!message.content.startsWith(prefix) || message.author.bot)
    return

  const args = message.content.slice(prefix.length).split(/ +/)
  const commandName = args.shift().toLowerCase()


  if (commandName.startsWith(prefix)) return

  //ANCHOR Get command
  let command = commandUtil.findCommand(commandName)

  if (!command) {
    command = commandUtil.findSubCommand(commandName)
  }

  if (!command)
    return console.log(ct.stripIndents(
      chalk`{bold Could not find command:} {bold.red ${prefix}${commandName}} {bold From:} {bold.red ${message.author.tag}}`
    ))

  //Check if command is supposed to be used
  if (command.helper)
    return console.log(`helper command '${command.name}' tried to be called by: ${message.author.tag}`)

  //Check if command needs arguments
  if (command.args && !args.length) {
    return message.reply(util.usage(command))
  }

  //Check if guild only
  if (command.guildOnly && message.channel.type !== 'text')
    return message.reply("That command cannot be used inside of dm's")

  if (!commandUtil.checkCommandPerms(command, message.author.id)) return
  if (commandUtil.IsOnCoolDown(command, message)) return

  //Try to execute command
  try {

    //Set current message in util
    util.getCurrentMessage(message)
    /**
    *
    *
    * @param {Discord.Message} message
    * @param {Array} args
    */
    await command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('error trying to call command')
  }
})

//bot login
client.login(token)
