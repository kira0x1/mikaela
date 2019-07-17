const stream = require('./stream')
const que = require('./queue')

module.exports = {
    name: 'stop',
    description: 'Stops the current song if one is playing, and then leaves the voice channel',
    aliases: ['leave', 'stop'],
    guildOnly: true,
    usage: ' ',

    //NOTE Leaves the voice channel
    async execute(message, args) {
        if (stream.InVoice())
            await stream.Leave(message)

        que.clearQueue()
    }
}