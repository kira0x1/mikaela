const stream = require('./stream')
const que = require('./queue')
const Discord = require('discord.js')

module.exports = {
    name: 'stop',
    description: 'Stops the current song if one is playing, and then leaves the voice channel',
    aliases: ['leave'],
    guildOnly: true,
    usage: ' ',

    //NOTE Leaves the voice channel

    /**
     *
     *
     * @param {Discord.Message} message
     * @param {Array} args
     */
    async execute(message, args) {
        const aliasUsed = message.content.slice(1).split(/ +/).shift().toLowerCase()

        if (stream.InVoice())
            await stream.Leave(message)

        if (aliasUsed === 'stop')
            que.clearQueue()
    }
}