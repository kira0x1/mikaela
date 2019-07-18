
const currency = require('./subcommands/database/currency')

//ANCHOR Sub Commands
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands/subcommands/database').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
    const command = require(`./subcommands/database/${file}`)
    subcommands.push({ name: command.name, command: command })
}


module.exports = {
    name: 'database',
    aliases: ['db'],
    description: 'Database testing command',
    subcommands: subcommands,

    execute(message, args) {
        const command = args.shift()
        const target = message.mentions.users.first() || message.author

        if (command === 'inventory') {
        } else if (command === 'transfer') {
        } else if (command === 'buy') {
        } else if (command === 'shop') {
        } else if (command === 'leaderboard') {
        }
        else if (command === 'give') {
        }
    },

    async init() {
        await currency.init()
    },
}