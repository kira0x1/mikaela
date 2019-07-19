const { init: userInit } = require('./db/users')
const { getUsers } = require('./db/users')

//ANCHOR Sub Commands
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands/db/').filter(file => file.endsWith('.js'))
let subcommands = []

for (const file of commandFiles) {
    const command = require(`./db/${file}`)
    subcommands.push({ name: command.name, command: command })
}

const flags = [
    (list = { name: 'list', aliases: ['l'], description: 'Lists favorite songs' })
]

module.exports = {
    name: 'favorites',
    aliases: ['fav', 'favorite'],
    description: 'Favourite songs',
    guildOnly: true,
    usage: '<flag>',
    subcommands: subcommands,
    args: true,
    flags: flags,

    async execute(message, args) {
        const arg = args.shift()
        const cmd = this.flags.find(f => f.name === arg || f.aliases && f.aliases.includes(arg))
        if (cmd.name === 'list')
            this.listFav(message)
    },

    listFav(message) {
        const users = getUsers()
        const userlist = users.map((user, position) =>
            `*${(position + 1)}:* **${user.user_name}**`).join('\n') || 'No users set.'
        return message.channel.send(userlist)
    },

    async init() {
        userInit()
    }
}