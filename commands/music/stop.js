const stream = require('./stream')

module.exports = {
    name: 'Stop',
    description: 'Stops the current song if one is playing, and then leaves the voice channel',
    aliases: ['leave', 'stop'],
    guildOnly: true,

    execute(message, args) {
        stream.Leave(message)
    }
}