const discord = require('discord.js')
const { prefix } = require('../config.json')
const { perms, usage, getFlagsString } = require('../util/util')
const { findSubCommand } = require('../util/commandUtil')

module.exports = {
  name: 'help',
  description: 'lists all commands',
  aliases: ['h', 'commands', 'mikaela', 'cmd'],
  guildOnly: false,
  usage: '[command name]',
  cooldown: 5,

  execute(message, args) {
    const data = []
    const embed = new discord.RichEmbed().setColor(0xc71459)
    const { commands } = message.client

    //ANCHOR List all commands
    //NOTE is called when no arguments are given

    if (!args.length) {
      data.push('List of commands:')
      data.push(commands.map(command => command.name && !command.helper).join(', '))
      data.push(`\nTo get info about a specific command send \`${prefix}<help> [command name]\``)

      // let embed = new discord.RichEmbed()
      embed.setTitle(data[0]).setFooter(data[2])

      commands.map(command => {
        if (perms(command.perms, message.author.id) && command !== undefined) {
          embed.addField(command.name, command.description)
        }
      })

      // ANCHOR send command list
      message.channel.send({ embed: embed })
    } else {
      // ANCHOR help-specific
      const name = args[0].toLowerCase()

      let command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

      if (!command) {
        // NOTE check if its a subcommand 
        const subCommand = findSubCommand(name)
        if (subCommand)
          command = subCommand
      }

      if (!command) {
        return message.channel.send(`command not found: ${name}`)
      }

      const embedSpecific = new discord.RichEmbed()
        .setTitle(`Command: ${command.name}`)
        .setColor(0xc71459)
        .setDescription(`\`Description: ${command.description}\``)
        .addField('Aliases', `\`${command.aliases || 'None'}\``)
        .addField('Cooldown', `\`${command.cooldown || 3} second(s)\``)

      if (command.usage)
        embedSpecific.addField('Usage', usage(command))

      if (command.subcommands !== undefined) {
        let subcmd = []
        command.subcommands.map(cmd => {
          if (!cmd.command.helper)
            subcmd.push(cmd.name)
        })

        if (subcmd.length > 0)
          embedSpecific.addField('Subcommands', `\`${subcmd}\``)
      }

      if (command.flags !== undefined) {
        embedSpecific.addBlankField()
        embedSpecific.addBlankField(true)

        command.flags.map(flag => {
          let flagAliases = []
          if (flag.aliases)
            flag.aliases.map(al => flagAliases.push(`***\`${al}\`***`))
          else
            flagAliases = '***`none`***'

          embedSpecific.addField(flag.name, `**aliases:** ${flagAliases}`, true)
        })
      }

      message.channel.send({ embed: embedSpecific })
    }
  },
}
