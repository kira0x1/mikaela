const q = require('./music/queHandler')
const stream = require('./music/stream')
const chalk = require('chalk')
const log = console.log
const { prefix } = require('../config.json')
const { getAlias } = require('../util/util')

const commands = [
    join = { name: 'join', description: 'join voice', method: stream.join },
    leave = { name: 'leave', description: 'leave voice', method: stream.leave },
    play = { name: 'play', description: 'play a song', method: stream.play }
]

module.exports = {
    name: 'proto',
    guildOnly: 'true',
    aliases: commands.map(cmd => cmd.name),

    async execute(message, args) {
        const alias = getAlias(commands, message.content)
        await alias.method(message, args)
    }
}