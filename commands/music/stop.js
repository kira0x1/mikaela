const stream = require('./stream')

module.exports = {
    name: 'Stop',
    description: 'Stops the current song if one is playing, and then leaves the voice channel',
    aliases: ['leave', 'stop'],
    guildOnly: true,
    usage: ' ',

    //NOTE Leaves the voice channel
    async execute(message, args) {
        await stream.Leave(message)
    }
}