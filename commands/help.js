const { prefix } = require('../config.json')

module.exports = {
    name: 'help',
    description: 'lists all commands',
    aliases: ['h', 'commands'],
    guildOnly: false,
    usage: '[command name]',
    cooldown: 1,

    execute(message, args) {

        const data = []
        const { commands } = message.client

        //Send all commands if no arguments given
        if (!args.length) {
            data.push('List of commands:')
            data.push(commands.map(command => command.name).join(', '))
            data.push(`\nTo get info about a specific command send \`${prefix}<help> [command name]\``)

            message.author.send(data, { split: true }).then(() => {
                if (message.channel.type === 'dm') {
                    return
                }

                message.reply('I sent you a DM with a list of commands :)')

            }).catch(error => {
                console.error(`Failed to send help DM to ${message.author.tag}.\n`, error)
                message.reply('Failed to DM you. You might have DM\'s disabled')
            })

            return
        }

        //Send specific command

        const name = args[0].toLowerCase()
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name))

        if (!command) {
            return message.reply('Could not find that command')
        }

        data.push(`**Name:** ${command.name}`)

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true })
    }
}