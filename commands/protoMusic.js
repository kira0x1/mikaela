const fs = require('fs')
const { findSubCommand } = require('../util/commandUtil')
const commandFiles = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
    const command = require(`./music/${file}`)
    subcommands.push({ name: command.name, command: command })
}

module.exports = {
    name: 'proto',
    description: 'music prototype',
    aliases: ['mp'],
    usage: '<subcommand>',
    subcommands: subcommands,
    guildOnly: true,

    execute(message, args) {
        let cmd = (findSubCommand(message.content.slice(1).split(/ +/)[0]))
        if (cmd) {
            console.log(`Subcommand: ${cmd.name} called!`)
        }
    }
}