const stream = require('./stream')

module.exports = {
    name: 'pause',
    description: 'Pause the stream',
    guildOnly: true,
    usage: ' ',

    async execute(message, args) {
        await stream.Pause()
    }
}