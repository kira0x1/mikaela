const Discord = require('discord.js')
const util = require('./util/util')
const commandUtil = require('./util/commandUtil')
const config = require('./config.json')

const token = config.keys.token
const prefix = config.prefix

const client = new Discord.Client()

client.once('ready', () => {
  commandUtil.initCommands(client)
  client.user.setActivity(`with commi's | ${prefix}help`, {
    type: 'PLAYING',
  })
  console.log(`${client.user.username} Online!`)
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

  if (!command) return console.log('could not find command ' + commandName)

  //Check if command is supposed to be used
  if (command.helper) return console.log(`helper command '${commandName}' tried to be called by: ${message.author.username}`)

  //Check if command needs arguments
  if (command.args && !args.length) {
    return message.reply(util.usage(command))
  }

  //Check if guild only
  if (command.guildOnly && message.channel.type !== 'text') {
    message.reply("That command cannot be used inside of dm's")
    return
  }

  if (!commandUtil.checkCommandPerms(command, message.author.id)) return
  if (commandUtil.IsOnCoolDown(command, message.author.id)) return

  //Try to execute command
  try {
    await command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('error trying to call command')
  }
})

//bot login
client.login(token)
