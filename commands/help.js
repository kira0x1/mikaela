const discord = require('discord.js')
const { prefix } = require('../config.json')
const { perms, usage } = require('../util/util')

module.exports = {
  name: 'help',
  description: 'lists all commands',
  aliases: ['h', 'commands', 'mikaela', 'cmd'],
  guildOnly: false,
  usage: '[command name]',
  cooldown: 15,

  execute(message, args) {
    const data = []
    const embed = new discord.RichEmbed().setColor(0xc71459)
    const { commands } = message.client

    //Send all commands if no arguments given
    if (!args.length) {
      data.push('List of commands:')
      data.push(commands.map(command => command.name).join(', '))
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
        commands.forEach(cmd => {
          if (cmd.subcommands) {
            cmd.subcommands.map(c => {
              if (c.name === name) return command = c.command
            })
          }
        });
      }

      if (!command) {
        return message.channel.send(`command not found: ${name}`)
      }

      const embedSpecific = new discord.RichEmbed()
        .setTitle(`Command: ${command.name}`)
        .setColor(0xc71459)
        .setDescription(`\`Description: ${command.description}\``)
        .addField('Aliases', `\`${command.aliases || 'None'}\``)
        .addField('Usage', usage(command))
        .addField('Cooldown', `\`${command.cooldown || 3} second(s)\``)

      if (command.subcommands !== undefined) {
        embedSpecific.addField('Subcommands', `\`${command.subcommands.map(c => c.name)}\``)
      }

      message.channel.send({ embed: embedSpecific })
    }
  },
}
