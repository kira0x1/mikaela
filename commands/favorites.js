const { init: userInit } = require('./db/users')

//ANCHOR Sub Commands
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands/db/').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
    const command = require(`./db/${file}`)
    subcommands.push({ name: command.name, command: command })
}

module.exports = {
    name: 'favorites',
    aliases: ['fav'],
    description: 'Favourite songs',
    guildOnly: true,
    subcommands: subcommands,
    helper: true,

    async init() {
        userInit()
    }
}