const stream = require('./stream')

module.exports = {
    name: 'resume',
    description: 'resume the stream',
    guildOnly: true,
    usage: ' ',

    async execute(message, args) {
        await stream.Resume()
    }
}