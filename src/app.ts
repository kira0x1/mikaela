import chalk from 'chalk'
import { Client, Collection, Message, MessageEmbed } from 'discord.js'
import { ICommand } from './classes/Command'
import { Player } from './classes/Player'
import { initEmoji } from './commands/music/play'
import { args as cmdArgs, isProduction, prefix, token } from './config'
import { dbInit } from './db/database'
import { initCommands } from './system/commandLoader'
import { initGreeter } from './system/serverGreeter'
import { syncRoles } from './system/syncRoles'
import { initVoiceManager } from './system/voiceManager'
import { findCommand, findCommandGroup, getCommandOverride, hasPerms } from './util/commandUtil'
import { embedColor, wrap } from './util/styleUtil'



const logging_on: boolean = cmdArgs['logcommands']

const envString = isProduction ? '-------production-------' : '-------development-------'
console.log(chalk.bgRedBright.bold(envString))

const client = new Client({
  presence: {
    activity: {
      name: 'Catgirls', type: 'STREAMING', url: 'https://github.com/kira0x1/mikaela'
    }
  }
})

const players: Collection<string, Player> = new Collection()

async function init() {
  await dbInit()
  client.login(token)
}

client.once('ready', () => {
  // Setup players
  client.guilds.cache.map(async guild => {
    const guildResolved = await client.guilds.fetch(guild.id)
    console.log(chalk.bgBlue.bold(`${guildResolved.name}, ${guildResolved.id}`))
    players.set(guildResolved.id, new Player(guildResolved, client))
  })

  // Save heart emoji to use for favorites
  initEmoji(client)

  // Add event listener to add/remove voice role
  initVoiceManager(client)

  // Add event listeners to #roles
  syncRoles(client)

  //Add event listener to welcome new members
  initGreeter(client)

  // Read command files and create a collection for the commands
  initCommands()

  console.log(chalk.bgCyan.bold(`${client.user.username} online!`))
})

// OnMessage
client.on('message', message => {
  // Check if message is from a bot and that the message starts with the prefix
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return
  }

  const firstCharacter = message.content.charAt(1)
  //Make sure the first character is not a number since people could just be writing decimals I.E .001
  if (firstCharacter === '.' || !isNaN(Number(firstCharacter))) return

  // Split up message into an array and remove the prefix
  let args = message.content.slice(prefix.length).split(/ +/)

  // Remove the first element from the args array ( this is the command name )
  let commandName = args.shift()
  if (!commandName || commandName.includes(prefix) || commandName === prefix) return

  // Set commandName to lowercase
  commandName = commandName.toLowerCase()

  // Search for the command
  let command = findCommand(commandName)

  // If the command wasnt found check if its in a commandgroup
  if (!command) {
    //Get the sub-command input given by the user
    const grp = findCommandGroup(commandName)

    if (grp) {
      //Get the sub-command input given by the user
      const subCmdName = args[0]

      //Check if the command-group contains the command
      command = grp.find(
        cmd =>
          cmd.name.toLowerCase() === subCmdName?.toLowerCase() ||
          (cmd.aliases && cmd.aliases.find(al => al.toLowerCase() === subCmdName?.toLowerCase()))
      )

      //If the command-group doesnt contain the command then check if the command-group has it set as an override
      if (!command) {
        command = getCommandOverride(commandName)
      } else {
        //? If the command is not an overdrive command then remove the first argument, since its a subcommand
        args.shift()
      }
    }
  }

  // If command not found send a message
  if (!command) return message.author.send(`command ${wrap(commandName || '')} not found`)

  if (!hasPerms(message.author.id, commandName))
    return message.author.send(`You do not have permission to use ${wrap(command.name)}`)

  //? If command arguments are required and not given send an error message
  if (command.args && args.length === 0) return sendArgsError(command, message)

  //? Execute the command if everything is ok

  try {
    command.execute(message, args)

    //? Log the output of who send the command and other information if logging is on
    if (logging_on)
      logCommand(message, command)
  } catch (err) {
    console.error(err)
  }
})

function logCommand(message, command) {
  console.log(chalk.bgMagenta.bold(`\n-----command-----\nuser: ${message.author.tag}\nserver: ${message.guild.name}\ncommand: ${command.name}\nargs: ${command.args}\n-----------------\n`))
}

export function sendArgsError(command: ICommand, message: Message) {
  let usageString = 'Arguments required'
  const embed = new MessageEmbed().setColor(embedColor)

  if (command.usage) {
    usageString = command.name + ' '
    usageString += wrap(command.usage, '`')
  }

  embed.addField('Arguments Required', usageString)
  return message.channel.send(embed)
}

export function setNewPlayer(guildId: string): Player {
  const guild = client.guilds.cache.get(guildId)
  const player = new Player(guild, client)
  players.set(guild.id, player)
  return player
}

export function findPlayer(guildId: string): Player {
  return players.get(guildId)
}

init()
