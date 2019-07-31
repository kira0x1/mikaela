const stream = require('./stream')
const queue = require('./queue')

module.exports = {
    name: 'join',
    description: 'Joins the voicechannel!',
    guildOnly: true,
    usage: ' ',

    async execute(message, args) {
        stream.Join(message)
    }
}