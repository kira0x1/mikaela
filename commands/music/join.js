const stream = require('./stream')

module.exports = {
    name: 'join',
    description: 'Joins the voicechannel!',
    guildOnly: true,
    usage: ' ',

    async execute(message, args) {
        await stream.Join(message)
    }
}